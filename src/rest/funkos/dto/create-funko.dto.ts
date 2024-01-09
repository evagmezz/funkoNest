import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateFunkoDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @Transform(({ value }) => value.trim())
  name: string
  @IsNumber({}, { message: 'El precio debe ser un numero' })
  @IsPositive({ message: 'El precio debe ser positivo' })
  price: number
  @IsNotEmpty({ message: 'La cantidad no puede estar vacia' })
  @IsPositive({ message: 'La cantidad debe ser positiva' })
  quantity: number
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @IsOptional()
  image?: string
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean
  category: string
}
