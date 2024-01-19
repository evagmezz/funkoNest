import { PartialType } from '@nestjs/mapped-types'
import { CreateFunkoDto } from './create-funko.dto'
import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @ApiProperty({
    example: '100',
    description: 'Funko price',
  })
  @IsNumber({}, { message: 'El precio debe ser un numero' })
  @IsOptional()
  price?: number

  @ApiProperty({
    example: '10',
    description: 'Funko quantity',
  })
  @IsOptional()
  @IsPositive({ message: 'La cantidad debe ser positiva' })
  quantity?: number

  @ApiProperty({
    example: 'https://www.google.com',
    description: 'Funko image',
  })
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @IsOptional()
  image?: string

  @ApiProperty({
    example: false,
    description: 'Funko is deleted status',
  })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean
}
