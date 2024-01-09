import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class CategoryDto {
  id: string
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string
  @IsDate()
  createdAt: Date
  @IsDate()
  updatedAt: Date
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
