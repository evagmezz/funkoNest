import { Module } from '@nestjs/common'
import { FunkosController } from './funkos/controller/funkos.controller'
import { FunkosService } from './funkos/services/funkos.service'
import { FunkosModule } from './funkos/funkos.module'
import { FunkoMapper } from './funkos/mapper/funko-mapper'

@Module({
  imports: [FunkosModule],
  controllers: [FunkosController],
  providers: [FunkosService, FunkoMapper],
})
export class AppModule {}
