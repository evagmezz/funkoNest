import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

import { Category } from '../../category/entities/category.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('funkos')
export class Funko {
  public static IMAGE_DEFAULT = 'https://via.placeholder.com/150'
  @PrimaryGeneratedColumn()
  id: number
  @Column({ type: 'varchar', nullable: false, length: 255 })
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string
  @Column({ type: 'decimal', default: 0.0 })
  @IsPositive({ message: 'El precio debe ser un numero positivo' })
  @IsNotEmpty({ message: 'El precio no puede estar vacio' })
  price: number
  @Column({ type: 'integer', default: 0 })
  @IsNotEmpty({ message: 'La cantidad no puede estar vacia' })
  @IsPositive({ message: 'La cantidad debe ser positiva' })
  @IsInt({ message: 'La cantidad debe ser un numero entero' })
  quantity: number
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @IsOptional()
  @Column({ type: 'text', default: Funko.IMAGE_DEFAULT })
  image: string = Funko.IMAGE_DEFAULT
  @IsDate()
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date
  @IsDate()
  @CreateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  isDeleted?: boolean
  @ManyToOne(() => Category, (category) => category.funkos)
  @JoinColumn({ name: 'category_id' })
  category: Category
}
