import { PartialType } from '@nestjs/mapped-types'
import { CreateOrderDto } from './create-order.dto'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { CreateClientDto } from './create-client.dto'
import { CreateOrderLineDto } from './create-orderLine.dto'

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsNumber()
  @IsNotEmpty()
  userId: number

  @IsNotEmpty()
  client: CreateClientDto

  @IsNotEmpty()
  orderLines: CreateOrderLineDto[]
}
