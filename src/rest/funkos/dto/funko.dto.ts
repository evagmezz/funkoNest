import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'
import { Transform } from 'class-transformer'

export class FunkoDto {
  id: number
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Transform(({ value }) => value.trim())
  name: string
  @IsPositive({ message: 'El precio debe ser un numero positivo' })
  @IsNotEmpty({ message: 'El precio no puede estar vacio' })
  price: number
  @IsNotEmpty({ message: 'La cantidad no puede estar vacia' })
  @IsPositive({ message: 'La cantidad debe ser un numero positivo' })
  @IsInt({ message: 'La cantidad debe ser un numero entero' })
  quantity: number
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @IsOptional()
  image?: string
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean
  category: string
}
