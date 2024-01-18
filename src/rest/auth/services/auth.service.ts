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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly authMapper: AuthMapper,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(userSignUpDto: UserSignUpDto) {
    this.logger.log(`Sign up ${userSignUpDto.username}`)

    const user = await this.usersService.create(
      this.authMapper.toCreateDto(userSignUpDto),
    )
    return this.getAccessToken(user.id)
  }

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
