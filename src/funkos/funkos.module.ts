import { Module } from '@nestjs/common'
import { FunkosService } from './services/funkos.service'
import { FunkosController } from './controller/funkos.controller'

@Module({
  controllers: [FunkosController],
  providers: [FunkosService],
})
export class FunkosModule {}
