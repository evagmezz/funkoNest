import { User } from '../entities/user.entity'
import { UserDto } from '../dto/user-response.dto'
import { Injectable } from '@nestjs/common'
import { UserRole } from '../entities/user-role.entity'
import { CreateUserDto } from '../dto/create-user.dto'

@Injectable()
export class UserMapper {
  toResponseDto(user: User): UserDto {
    const userDto = new UserDto()
    userDto.id = user.id
    userDto.name = user.name
    userDto.lastName = user.lastName
    userDto.username = user.username
    userDto.email = user.email
    userDto.createdAt = user.createdAt
    userDto.updatedAt = user.updatedAt
    userDto.isDeleted = user.isDeleted
    userDto.roles = user.roles.map((role) => role.role)
    return userDto
  }

  toResponseDtoWithRoles(user: User, roles: UserRole[]): UserDto {
    const userDto = new UserDto()
    userDto.id = user.id
    userDto.name = user.name
    userDto.lastName = user.lastName
    userDto.username = user.username
    userDto.email = user.email
    userDto.createdAt = user.createdAt
    userDto.updatedAt = user.updatedAt
    userDto.isDeleted = user.isDeleted
    userDto.roles = roles.map((role) => role.role)
    return userDto
  }

  toEntity(createUserDto: CreateUserDto): User {
    const user = new User()
    user.name = createUserDto.name
    user.lastName = createUserDto.lastName
    user.email = createUserDto.email
    user.username = createUserDto.username
    user.password = createUserDto.password
    user.createdAt = new Date()
    user.updatedAt = new Date()
    user.isDeleted = false
    return user
  }
}
