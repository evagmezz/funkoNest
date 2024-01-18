import { Module } from '@nestjs/common'
import { UsersService } from './services/users.service'
import { UsersController } from './controller/users.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@nestjs/cache-manager'
import { BcryptService } from './bcrypt.service'
import { User } from './entities/user.entity'
import { UserRole } from './entities/user-role.entity'
import { OrdersModule } from '../orders/orders.module'
import { UserMapper } from './mapper/user-mapper'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserRole]),
    CacheModule.register(),
    OrdersModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserMapper, BcryptService],
  exports: [UsersService],
})
export class UsersModule {}
