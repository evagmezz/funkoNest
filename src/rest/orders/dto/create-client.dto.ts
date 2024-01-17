import {
  IsEmail,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator'
import { CreateAddressDto } from './create-address.dto'

export class CreateClientDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  name: string

  @IsString()
  @MaxLength(100)
  @IsEmail()
  email: string

  @IsPositive()
  @MaxLength(9)
  @IsNotEmpty()
  phone: number

  @IsNotEmpty()
  address: CreateAddressDto
}
