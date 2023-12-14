import { Module } from '@nestjs/common'
import { FunkosService } from './services/funkos.service'
import { FunkosController } from './controller/funkos.controller'
import { FunkoMapper } from './mapper/funko-mapper'

@Module({
  controllers: [FunkosController],
  providers: [FunkosService, FunkoMapper],
})
export class FunkosModule {}
