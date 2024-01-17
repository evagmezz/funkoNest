import { IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator'

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  street: string

  @IsNotEmpty()
  @IsPositive()
  @MaxLength(50)
  number: number

  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  city: string

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  province: string

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  country: string

  @IsPositive()
  @MaxLength(5)
  @IsNotEmpty()
  zip: number
}
