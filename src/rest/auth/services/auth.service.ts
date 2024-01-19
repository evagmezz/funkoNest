import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../../users/services/users.service'
import { UserSignUpDto } from '../dto/user-sign.up.dto'
import { AuthMapper } from '../mapper/auth-mapper'
import { UserSignInDto } from '../dto/user-sign.in.dto'

/**
 * Servicio que gestiona la lógica de autenticación de usuarios.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  /**
   * Constructor del servicio de autenticación.
   *
   * @param {UsersService} usersService - Servicio de usuarios utilizado para la gestión de usuarios.
   * @param {AuthMapper} authMapper - Mapper utilizado para mapear datos relacionados con la autenticación.
   * @param {JwtService} jwtService - Servicio JWT utilizado para la generación de tokens de acceso.
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly authMapper: AuthMapper,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario y devuelve un token de acceso.
   *
   * @param {UserSignUpDto} userSignUpDto - Datos del usuario para el registro.
   * @returns {Promise<{ access_token: string }>} - Promesa que representa el resultado del registro con el token de acceso.
   */
  async signUp(userSignUpDto: UserSignUpDto) {
    this.logger.log(`Sign up ${userSignUpDto.username}`)

    const user = await this.usersService.create(
      this.authMapper.toCreateDto(userSignUpDto),
    )
    return this.getAccessToken(user.id)
  }

  /**
   * Inicia sesión de un usuario y devuelve un token de acceso.
   *
   * @param {UserSignInDto} userSignInDto - Datos del usuario para el inicio de sesión.
   * @returns {Promise<{ access_token: string }>} - Promesa que representa el resultado del inicio de sesión con el token de acceso.
   * @throws {BadRequestException} - Si el nombre de usuario o la contraseña son inválidos.
   */
  async signIn(userSignInDto: UserSignInDto) {
    this.logger.log(`Sign in ${userSignInDto.username}`)
    const user = await this.usersService.findByUsername(userSignInDto.username)
    if (!user) {
      throw new BadRequestException('username or password are invalid')
    }
    const isValidPassword = await this.usersService.validatePassword(
      userSignInDto.password,
      user.password,
    )
    if (!isValidPassword) {
      throw new BadRequestException('username or password are invalid')
    }
    return this.getAccessToken(user.id)
  }

  /**
   * Valida un usuario por su ID.
   *
   * @param {number} id - ID del usuario a validar.
   * @returns {Promise<any>} - Promesa que representa el resultado de la validación del usuario.
   */
  async validateUser(id: number) {
    this.logger.log(`Validating user ${id}`)
    return await this.usersService.findOne(id)
  }

  private getAccessToken(userId: number) {
    this.logger.log(`Getting access token ${userId}`)
    try {
      const payload = {
        id: userId,
      }
      const access_token = this.jwtService.sign(payload)
      return {
        access_token,
      }
    } catch (error) {
      this.logger.error(error)
      throw new ConflictException('Error generating access token')
    }
  }
}
