import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SocialPostsService } from './social-posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/social-post.dto';

@Controller('social-posts')
export class SocialPostsController {
  constructor(private readonly postsService: SocialPostsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }

  @Post(':id/publish')
  publishNow(@Param('id') id: string) {
    return this.postsService.publishNow(+id);
  }

  @Post(':id/retry')
  retryPost(@Param('id') id: string) {
    return this.postsService.retryPost(+id);
  }

  @Post(':id/repost')
  repost(@Param('id') id: string) {
    return this.postsService.repost(+id);
  }

  @Post(':id/schedule')
  schedulePost(@Param('id') id: string, @Body('scheduledTime') scheduledTime: string) {
    return this.postsService.schedulePost(+id, scheduledTime);
  }

  // Upload images for posts
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (_req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = files.map((f) => `/uploads/posts/${f.filename}`);
    return { success: true, urls };
  }
}
