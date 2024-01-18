import { Module } from '@nestjs/common'
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose'
import { Order } from './schemas/order.schema'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import { Funko } from '../funkos/entities/funko.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@nestjs/cache-manager'
import { OrdersController } from './controller/orders.controller'
import { OrdersService } from './services/orders.service'
import { User } from '../users/entities/user.entity'
import { OrdersMapper } from './mapper/orders.mapper'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Order.name,
        useFactory: () => {
          const schema = SchemaFactory.createForClass(Order)
          schema.plugin(mongoosePaginate)
          return schema
        },
      },
    ]),
    TypeOrmModule.forFeature([Funko]),
    CacheModule.register(),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersMapper],
  exports: [OrdersService],
})
export class OrdersModule {}
