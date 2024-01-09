import { Module } from '@nestjs/common'
import { FunkosService } from './services/funkos.service'
import { FunkosController } from './controller/funkos.controller'
import { FunkoMapper } from './mapper/funko-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Funko } from './entities/funko.entity'
import { Category } from '../category/entities/category.entity'
import { StorageModule } from '../storage/storage.module'
import { CacheModule } from '@nestjs/cache-manager'
import { NotificationsModule } from '../../websockets/notifications/notifications.module'

@Module({
  controllers: [FunkosController],
  providers: [FunkosService, FunkoMapper],
  imports: [
    TypeOrmModule.forFeature([Funko]),
    TypeOrmModule.forFeature([Category]),
    StorageModule,
    NotificationsModule,
    CacheModule.register(),
  ],
})
export class FunkosModule {}
