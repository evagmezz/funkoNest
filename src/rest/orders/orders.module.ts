import { Module } from '@nestjs/common'
import { OrdersService } from './services/orders.service'
import { OrdersController } from './controller/orders.controller'
import { OrdersMapper } from './mapper/orders.mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Order } from './schemas/order.schema'
import { Funko } from '../funkos/entities/funko.entity'
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'

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
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersMapper],
})
export class OrdersModule {}
