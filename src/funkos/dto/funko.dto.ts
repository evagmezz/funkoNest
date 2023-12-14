import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator'
import { Category } from '../entities/funko.entity'

export class FunkoDto {
  id: number
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string
  @IsPositive({ message: 'El precio debe ser un numero positivo' })
  @IsNotEmpty({ message: 'El precio no puede estar vacio' })
  price: number
  @IsNotEmpty({ message: 'La cantidad no puede estar vacia' })
  @IsPositive({ message: 'La cantidad debe ser un numero positivo' })
  @IsInt({ message: 'La cantidad debe ser un numero entero' })
  quantity: number
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La imagen no puede estar vacia' })
  image: string
  @IsDate()
  createdAt: Date
  @IsDate()
  updatedAt: Date
  @IsEnum(Category, { message: 'La categoria no es valida' })
  category: Category
}
