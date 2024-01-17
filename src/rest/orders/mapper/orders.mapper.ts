import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateOrderDto } from '../dto/create-order.dto'
import { Order } from '../schemas/order.schema'

@Injectable()
export class OrdersMapper {
  toEntity(createOrderDto: CreateOrderDto): Order {
    return plainToClass(Order, createOrderDto)
  }
}
