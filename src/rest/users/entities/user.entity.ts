import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserRole } from './user-role.entity'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  lastName: string

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string

  @Column({ unique: true, length: 255, nullable: false })
  username: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean

  @OneToMany(() => UserRole, (userRole) => userRole.user, { eager: true })
  roles: UserRole[]

  get roleNames(): string[] {
    return this.roles.map((role) => role.role)
  }
}
