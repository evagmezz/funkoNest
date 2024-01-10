import { Module } from '@nestjs/common'
import { CategoryService } from './services/category.service'
import { CategoryController } from './controllers/category.controller'
import { CategoryMapper } from './mapper/category-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from './entities/category.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { NotificationsGateway } from '../../websockets/notifications/notifications.gateway'

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryMapper, NotificationsGateway],
  imports: [TypeOrmModule.forFeature([Category]), CacheModule.register()],
})
export class CategoryModule {}
