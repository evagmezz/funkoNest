import { Module } from '@nestjs/common'
import { FunkosModule } from './rest/funkos/funkos.module'
import { CategoryModule } from './rest/category/category.module'
import { StorageModule } from './rest/storage/storage.module'
import { ConfigModule } from '@nestjs/config'
import { CacheModule } from '@nestjs/cache-manager'
import { DatabaseModule } from './config/database/database.module'
import { OrdersModule } from './rest/orders/orders.module'
import { NotificationsModule } from './websockets/notifications/notifications.module'
import { UsersModule } from './rest/users/users.module'
import { AuthModule } from './rest/auth/auth.module'
import { CorsConfigModule } from './config/cors/cors.module'

@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'dev'
        ? { envFilePath: '.env.dev' || '.env' }
        : { envFilePath: '.env.prod' },
    ),
    CorsConfigModule,
    DatabaseModule,
    CacheModule.register(),
    FunkosModule,
    CategoryModule,
    StorageModule,
    NotificationsModule,
    OrdersModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
