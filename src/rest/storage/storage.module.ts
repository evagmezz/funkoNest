import { Module } from '@nestjs/common'
import { StorageController } from './controller/storage.controller'
import { StorageService } from './services/storage.service'

@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
