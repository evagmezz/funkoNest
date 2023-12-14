import { Category } from '../entities/funko.entity'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator'

export class CreateFunkoDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  name: string
  @IsNumber({}, { message: 'El precio debe ser un numero' })
  @IsPositive({ message: 'El precio debe ser positivo' })
  price?: number
  @IsNotEmpty({ message: 'La cantidad no puede estar vacia' })
  @IsPositive({ message: 'La cantidad debe ser positiva' })
  @IsInt({ message: 'La cantidad debe ser un numero entero' })
  quantity: number
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La imagen no puede estar vacia' })
  image: string
  @IsEnum(Category, { message: 'La categoria no es valida' })
  category?
}
