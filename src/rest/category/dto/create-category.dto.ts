import { IsNotEmpty, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Transform(({ value }) => value.trim())
  @ApiProperty({ example: 'Marvel', description: 'Category name' })
  name: string
}
