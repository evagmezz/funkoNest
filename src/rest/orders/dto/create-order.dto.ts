import { IsNotEmpty, IsNumber } from 'class-validator'
import { CreateClientDto } from './create-client.dto'
import { CreateOrderLineDto } from './create-orderLine.dto'

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number

  @IsNotEmpty()
  client: CreateClientDto

  @IsNotEmpty()
  orderLines: CreateOrderLineDto[]
}
