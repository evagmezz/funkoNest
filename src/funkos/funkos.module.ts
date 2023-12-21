import { Module } from '@nestjs/common'
import { FunkosService } from './services/funkos.service'
import { FunkosController } from './controller/funkos.controller'
import { FunkoMapper } from './mapper/funko-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Funko } from './entities/funko.entity'
import { Category } from '../category/entities/category.entity'

@Module({
  controllers: [FunkosController],
  providers: [FunkosService, FunkoMapper],
  imports: [
    TypeOrmModule.forFeature([Funko]),
    TypeOrmModule.forFeature([Category]),
  ],
})
export class FunkosModule {}
