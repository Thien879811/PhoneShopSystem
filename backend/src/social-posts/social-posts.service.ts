import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SocialPost, PostStatus } from './entities/social-post.entity';
import { PostImage } from './entities/post-image.entity';
import { PostPlatform } from './entities/post-platform.entity';
import { SocialAccount } from './entities/social-account.entity';
import { CreatePostDto, UpdatePostDto } from './dto/social-post.dto';
import axios from 'axios';

@Injectable()
export class SocialPostsService {
  private readonly logger = new Logger(SocialPostsService.name);

  constructor(
    @InjectRepository(SocialPost)
    private readonly postRepo: Repository<SocialPost>,
    @InjectRepository(PostImage)
    private readonly imageRepo: Repository<PostImage>,
    @InjectRepository(PostPlatform)
    private readonly platformRepo: Repository<PostPlatform>,
    @InjectRepository(SocialAccount)
    private readonly accountRepo: Repository<SocialAccount>,
  ) {}

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, status, search } = query;
    const skip = (page - 1) * limit;

    const qb = this.postRepo.createQueryBuilder('post')
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      qb.andWhere('post.status = :status', { status });
    }
    if (search) {
      qb.andWhere('(post.title LIKE :search OR post.content LIKE :search)', {
        search: `%${search}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();

    // Load relations manually
    for (const post of data) {
      post.images = await this.imageRepo.find({ where: { postId: post.id } });
      post.platforms = await this.platformRepo.find({
        where: { postId: post.id },
        relations: ['account'],
      });
    }

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    post.images = await this.imageRepo.find({ where: { postId: id } });
    post.platforms = await this.platformRepo.find({
      where: { postId: id },
      relations: ['account'],
    });
    return post;
  }

  async create(dto: CreatePostDto) {
    const post = new SocialPost();
    post.title = dto.title;
    post.content = dto.content;
    post.scheduledTime = dto.scheduledTime ? new Date(dto.scheduledTime) : null;
    post.isRepeated = dto.isRepeated || false;
    post.repeatInterval = dto.repeatInterval || 0;
    post.status = dto.scheduledTime ? PostStatus.SCHEDULED : PostStatus.DRAFT;

    const savedPost = await this.postRepo.save(post);

    // Save images
    if (dto.images && dto.images.length > 0) {
      const images = dto.images.map((url) => {
        const img = new PostImage();
        img.postId = savedPost.id;
        img.imageUrl = url;
        return img;
      });
      await this.imageRepo.save(images);
    }

    // Save platform assignments
    if (dto.platformIds && dto.platformIds.length > 0) {
      const platforms = dto.platformIds.map((accountId) => {
        const pp = new PostPlatform();
        pp.postId = savedPost.id;
        pp.accountId = accountId;
        pp.status = 'PENDING';
        return pp;
      });
      await this.platformRepo.save(platforms);
    }

    return this.findOne(savedPost.id);
  }

  async update(id: number, dto: UpdatePostDto) {
    const post = await this.findOne(id);

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.scheduledTime !== undefined) {
      post.scheduledTime = dto.scheduledTime ? new Date(dto.scheduledTime) : null;
    }
    if (dto.status !== undefined) post.status = dto.status as PostStatus;
    if (dto.isRepeated !== undefined) post.isRepeated = dto.isRepeated;
    if (dto.repeatInterval !== undefined) post.repeatInterval = dto.repeatInterval;

    await this.postRepo.save(post);

    // Update images
    if (dto.images !== undefined) {
      await this.imageRepo.delete({ postId: id });
      if (dto.images.length > 0) {
        const images = dto.images.map((url) => {
          const img = new PostImage();
          img.postId = id;
          img.imageUrl = url;
          return img;
        });
        await this.imageRepo.save(images);
      }
    }

    // Update platform assignments
    if (dto.platformIds !== undefined) {
      await this.platformRepo.delete({ postId: id });
      if (dto.platformIds.length > 0) {
        const platforms = dto.platformIds.map((accountId) => {
          const pp = new PostPlatform();
          pp.postId = id;
          pp.accountId = accountId;
          pp.status = 'PENDING';
          return pp;
        });
        await this.platformRepo.save(platforms);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    // Delete related records first
    await this.imageRepo.delete({ postId: id });
    await this.platformRepo.delete({ postId: id });
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    await this.postRepo.remove(post);
    return { success: true };
  }

  // Schedule post
  async schedulePost(id: number, scheduledTime: string) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    post.scheduledTime = new Date(scheduledTime);
    post.status = PostStatus.SCHEDULED;
    return this.postRepo.save(post);
  }

  // Publish post immediately
  async publishNow(id: number) {
    const post = await this.findOne(id);
    return this.publishPost(post);
  }

  // Retry failed post
  async retryPost(id: number) {
    const post = await this.findOne(id);
    // Reset failed platforms to PENDING
    for (const platform of post.platforms) {
      if (platform.status === 'FAILED') {
        platform.status = 'PENDING';
        await this.platformRepo.save(platform);
      }
    }
    post.status = PostStatus.POSTING;
    await this.postRepo.save(post);
    return this.publishPost(post);
  }

  // Repost logic
  async repost(id: number) {
    const post = await this.findOne(id);
    
    // Reset all platforms to PENDING
    for (const platform of post.platforms) {
      platform.status = 'PENDING';
      await this.platformRepo.save(platform);
    }
    
    post.status = PostStatus.POSTING;
    await this.postRepo.save(post);
    return this.publishPost(post);
  }

  // Cron job: check every minute for scheduled posts
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledPosts() {
    const now = new Date();
    const posts = await this.postRepo.find({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledTime: LessThanOrEqual(now),
      },
    });

    for (const p of posts) {
      this.logger.log(`Auto-publishing scheduled post #${p.id}: ${p.title}`);
      try {
        const fullPost = await this.findOne(p.id);
        await this.publishPost(fullPost);
      } catch (err: any) {
        this.logger.error(`Failed to publish post #${p.id}: ${err.message}`);
      }
    }
  }

  // Core publish logic
  private async publishPost(post: SocialPost) {
    post.status = PostStatus.POSTING;
    await this.postRepo.save(post);

    let allSuccess = true;
    let anySuccess = false;

    for (const platform of post.platforms) {
      if (platform.status === 'POSTED') {
        anySuccess = true;
        continue;
      }

      try {
        platform.status = 'POSTING';
        await this.platformRepo.save(platform);

        let result: any;
        if (platform.account.platform === 'facebook') {
          result = await this.publishToFacebook(post, platform.account);
        } else if (platform.account.platform === 'zalo') {
          result = await this.publishToZalo(post, platform.account);
        }

        platform.status = 'POSTED';
        platform.response = JSON.stringify(result);
        platform.postedAt = new Date();
        anySuccess = true;
      } catch (err: any) {
        platform.status = 'FAILED';
        platform.response = JSON.stringify({
          error: err.response?.data || err.message,
        });
        allSuccess = false;
      }
      await this.platformRepo.save(platform);
    }

    // Update overall post status
    const finalStatus = allSuccess
      ? PostStatus.POSTED
      : anySuccess
        ? PostStatus.POSTED
        : PostStatus.FAILED;

    if (finalStatus === PostStatus.POSTED && post.isRepeated && post.repeatInterval > 0) {
      // Logic for repetition: schedule the next post
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + post.repeatInterval);
      
      post.scheduledTime = nextDate;
      post.status = PostStatus.SCHEDULED;
      
      // Reset statuses for platforms for the next run
      for (const platform of post.platforms) {
        platform.status = 'PENDING';
        platform.postedAt = null;
        await this.platformRepo.save(platform);
      }
    } else {
      post.status = finalStatus;
    }
    
    await this.postRepo.save(post);

    return this.findOne(post.id);
  }

  // Facebook API integration
  private async publishToFacebook(post: SocialPost, account: SocialAccount) {
    const baseUrl = account.apiUrl || 'https://graph.facebook.com';

    if (post.images && post.images.length > 0) {
      if (post.images.length === 1) {
        const response = await axios.post(`${baseUrl}/${account.pageId}/photos`, null, {
          params: {
            url: post.images[0].imageUrl,
            caption: post.content,
            access_token: account.accessToken,
          },
        });
        return response.data;
      } else {
        // Multi-photo post
        const photoIds: string[] = [];
        for (const image of post.images) {
          const res = await axios.post(`${baseUrl}/${account.pageId}/photos`, null, {
            params: {
              url: image.imageUrl,
              published: false,
              access_token: account.accessToken,
            },
          });
          photoIds.push(res.data.id);
        }

        const attachedMedia: Record<string, string> = {};
        photoIds.forEach((photoId, idx) => {
          attachedMedia[`attached_media[${idx}]`] = JSON.stringify({ media_fbid: photoId });
        });

        const response = await axios.post(`${baseUrl}/${account.pageId}/feed`, null, {
          params: {
            message: post.content,
            ...attachedMedia,
            access_token: account.accessToken,
          },
        });
        return response.data;
      }
    } else {
      const response = await axios.post(`${baseUrl}/${account.pageId}/feed`, null, {
        params: {
          message: post.content,
          access_token: account.accessToken,
        },
      });
      return response.data;
    }
  }

  // Zalo API integration
  private async publishToZalo(post: SocialPost, account: SocialAccount) {
    const response = await axios.post(
      'https://openapi.zalo.me/v2.0/oa/message',
      {
        recipient: { user_id: 'all' },
        message: { text: post.content },
      },
      {
        headers: {
          access_token: account.accessToken,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  }
}
