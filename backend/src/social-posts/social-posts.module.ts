import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAccount } from './entities/social-account.entity';
import { SocialPost } from './entities/social-post.entity';
import { PostImage } from './entities/post-image.entity';
import { PostPlatform } from './entities/post-platform.entity';
import { SocialAccountsService } from './social-accounts.service';
import { SocialAccountsController } from './social-accounts.controller';
import { SocialPostsService } from './social-posts.service';
import { SocialPostsController } from './social-posts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SocialAccount, SocialPost, PostImage, PostPlatform]),
  ],
  controllers: [SocialAccountsController, SocialPostsController],
  providers: [SocialAccountsService, SocialPostsService],
  exports: [SocialAccountsService, SocialPostsService],
})
export class SocialPostsModule {}
