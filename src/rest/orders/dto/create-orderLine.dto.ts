import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator'

export class CreateOrderLineDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  quantity: number

  @IsNumber()
  @IsNotEmpty()
  funkoId: number

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  funkoPrice: number

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  total: number
}
