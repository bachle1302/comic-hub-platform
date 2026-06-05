import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLogsModule as AdminAuditLogsModule } from './admin/audit-logs/audit-logs.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AuthorsModule as AdminAuthorsModule } from './admin/authors/authors.module';
import { CategoriesModule as AdminCategoriesModule } from './admin/categories/categories.module';
import { ChaptersModule as AdminChaptersModule } from './admin/chapters/chapters.module';
import { CoinPackagesModule as AdminCoinPackagesModule } from './admin/coin-packages/coin-packages.module';
import { ComicsModule as AdminComicsModule } from './admin/comics/comics.module';
import { DashboardModule as AdminDashboardModule } from './admin/dashboard/dashboard.module';
import { UploadModule as AdminUploadModule } from './admin/upload/upload.module';
import { UsersModule as AdminUsersModule } from './admin/users/users.module';
import { CommentReportsModule as AdminCommentReportsModule } from './admin/comment-reports/comment-reports.module';
import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { ContactTicketsModule } from './contact-tickets/contact-tickets.module';
import { ComicsModule } from './comics/comics.module';
import { FollowsModule } from './follows/follows.module';
import { HealthModule } from './health/health.module';
import { HistoriesModule } from './histories/histories.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { PurchasesModule } from './purchases/purchases.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { TokenBucketGuard } from './rate-limit/token-bucket.guard';
import { ReaderModule } from './reader/reader.module';
import { RedisModule } from './redis/redis.module';
import { SearchModule } from './search/search.module';
import { StorageModule } from './storage/storage.module';
import { envValidationSchema } from './config/env.validation';
import { MaintenanceGuard } from './common/guards/maintenance.guard';
import { SystemSettingsModule } from './system-settings/system-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      expandVariables: true,
    }),
    PrismaModule,
    RedisModule,
    RateLimitModule,
    AuthModule,
    ComicsModule,
    CommentsModule,
    ContactTicketsModule,
    SearchModule,
    CategoriesModule,
    AuthorsModule,
    AnnouncementsModule,
    AdminAuthorsModule,
    AdminAuditLogsModule,
    AdminCategoriesModule,
    AdminCoinPackagesModule,
    AdminComicsModule,
    AdminChaptersModule,
    AdminCommentReportsModule,
    AdminDashboardModule,
    AdminUsersModule,
    StorageModule,
    AdminUploadModule,
    PurchasesModule,
    PaymentsModule,
    ReaderModule,
    FollowsModule,
    HealthModule,
    HistoriesModule,
    NotificationsModule,
    SystemSettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TokenBucketGuard,
    },
  ],
})
export class AppModule {}
