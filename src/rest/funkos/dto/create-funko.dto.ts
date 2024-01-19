import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class CreateFunkoDto {
  @ApiProperty({
    example: 'Spiderman',
    description: 'Funko name',
    format: 'string',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @Transform(({ value }) => value.trim())
  name: string

  @ApiProperty({
    example: '100',
    description: 'Funko price',
    minLength: 0,
  })
  @IsNumber({}, { message: 'El precio debe ser un numero' })
  @IsPositive({ message: 'El precio debe ser positivo' })
  price: number

  @ApiProperty({
    example: '10',
    description: 'Funko quantity',
    minLength: 0,
  })
  @IsNotEmpty({ message: 'La cantidad no puede estar vacia' })
  @IsPositive({ message: 'La cantidad debe ser positiva' })
  quantity: number

  @ApiProperty({
    example: 'https://www.google.com',
    description: 'Funko image',
    format: 'string',
    required: false,
  })
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @IsOptional()
  image?: string

  @ApiProperty({
    example: false,
    description: 'Funko is deleted status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean

  @ApiProperty({
    example: 'Marvel',
    description: 'Funko category',
  })
  category: string
}
