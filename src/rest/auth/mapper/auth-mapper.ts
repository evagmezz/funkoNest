import { Injectable } from '@nestjs/common'
import { UserSignUpDto } from '../dto/user-sign.up.dto'
import { Role } from '../../users/entities/user-role.entity'
import { CreateUserDto } from '../../users/dto/create-user.dto'

@Injectable()
export class AuthMapper {
  /**
   * Convierte un objeto UserSignUpDto en un objeto CreateUserDto.
   *
   * @param {UserSignUpDto} userSignUpDto - Objeto de tipo UserSignUpDto a ser mapeado.
   * @returns {CreateUserDto} - Objeto de tipo CreateUserDto resultante del mapeo.
   */
  toCreateDto(userSignUpDto: UserSignUpDto): CreateUserDto {
    const userCreateDto = new CreateUserDto()
    /**
     * Asignar propiedades del UserSignUpDto al CreateUserDto
     */
    userCreateDto.name = userSignUpDto.name
    userCreateDto.lastName = userSignUpDto.lastName
    userCreateDto.username = userSignUpDto.username
    userCreateDto.email = userSignUpDto.email
    userCreateDto.password = userSignUpDto.password
    userCreateDto.roles = [Role.USER]
    /**
     * Establecer el rol predeterminado como Role.USER
     */
    return userCreateDto
  }
}
