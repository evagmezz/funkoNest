import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { Funko } from '../../funkos/entities/funko.entity'
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { v4 as uuidv4 } from 'uuid'

@Entity('categories')
export class Category {
  @PrimaryColumn({ type: 'uuid' })
  @IsUUID('4', { message: 'El id debe ser un UUID' })
  id: string = uuidv4()
  @Column({ type: 'varchar', nullable: false, unique: true, length: 255 })
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @IsDate()
  createdAt: Date
  @CreateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @IsDate()
  updatedAt: Date
  @IsOptional()
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  @IsBoolean()
  isActive?: boolean

  @OneToMany(() => Funko, (funko) => funko.category)
  funkos: Funko[]
}
