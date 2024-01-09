import { Module } from '@nestjs/common'
import { CategoryService } from './services/category.service'
import { CategoryController } from './controllers/category.controller'
import { CategoryMapper } from './mapper/category-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from './entities/category.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { NotificationsModule } from '../../websockets/notifications/notifications.module'

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryMapper],
  imports: [
    TypeOrmModule.forFeature([Category]),
    CacheModule.register(),
    NotificationsModule,
  ],
})
export class CategoryModule {}
