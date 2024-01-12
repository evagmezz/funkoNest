import { Module } from '@nestjs/common'
import { FunkosModule } from './rest/funkos/funkos.module'
import { CategoryModule } from './rest/category/category.module'
import { StorageModule } from './rest/storage/storage.module'
import { ConfigModule } from '@nestjs/config'
import { CacheModule } from '@nestjs/cache-manager'
import { DatabaseModule } from './config/database/database.module'

@Module({
  imports: [
    CacheModule.register(),
    FunkosModule,
    CategoryModule,
    StorageModule,
    ConfigModule.forRoot(),
    DatabaseModule,
  ],
})
export class AppModule {}
