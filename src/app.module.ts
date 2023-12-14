import { Module } from '@nestjs/common'
import { FunkosController } from './funkos/controller/funkos.controller'
import { FunkosService } from './funkos/services/funkos.service'
import { FunkosModule } from './funkos/funkos.module'

@Module({
  imports: [FunkosModule],
  controllers: [FunkosController],
  providers: [FunkosService],
})
export class AppModule {}
