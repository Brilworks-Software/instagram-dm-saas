import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { InstagramCookieController } from './instagram-cookie.controller';
import { InstagramCookieService } from './instagram-cookie.service';
import { InstagramBrowserService } from './instagram-browser.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [ConfigModule, PrismaModule, NotificationModule],
  controllers: [InstagramController, InstagramCookieController],
  providers: [InstagramService, InstagramCookieService, InstagramBrowserService],
  exports: [InstagramService, InstagramCookieService, InstagramBrowserService],
})
export class InstagramModule {}

