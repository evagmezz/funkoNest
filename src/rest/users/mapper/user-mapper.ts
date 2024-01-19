import { User } from '../entities/user.entity'
import { UserDto } from '../dto/user-response.dto'
import { Injectable } from '@nestjs/common'
import { UserRole } from '../entities/user-role.entity'
import { CreateUserDto } from '../dto/create-user.dto'

/**
 * Servicio encargado de mapear objetos relacionados con la entidad de usuario.
 *
 * Este servicio proporciona métodos para convertir instancias de la entidad de usuario
 * y objetos de transferencia de datos (DTO) asociados.
 */
@Injectable()
export class UserMapper {
  /**
   * Convierte una instancia de la entidad de usuario a un objeto de transferencia de datos (DTO) de respuesta.
   *
   * @param {User} user - Instancia de la entidad de usuario.
   * @returns {UserDto} - Objeto de transferencia de datos (DTO) de respuesta correspondiente al usuario.
   */
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

  /**
   * Convierte una instancia de la entidad de usuario a un objeto de transferencia de datos (DTO) de respuesta
   * que incluye roles específicos proporcionados.
   *
   * @param {User} user - Instancia de la entidad de usuario.
   * @param {UserRole[]} roles - Roles asociados al usuario.
   * @returns {UserDto} - Objeto de transferencia de datos (DTO) de respuesta correspondiente al usuario con roles específicos.
   */
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

  /**
   * Convierte un objeto de transferencia de datos (DTO) de creación de usuario a una instancia de la entidad de usuario.
   *
   * @param {CreateUserDto} createUserDto - Objeto de transferencia de datos (DTO) de creación de usuario.
   * @returns {User} - Instancia de la entidad de usuario creada a partir del DTO.
   */
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
