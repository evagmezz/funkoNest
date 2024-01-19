import { Body, Controller, Post } from '@nestjs/common'

import { UserSignUpDto } from '../dto/user-sign.up.dto'
import { UserSignInDto } from '../dto/user-sign.in.dto'
import { AuthService } from '../services/auth.service'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiExcludeEndpoint,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

@Controller('api/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiExcludeEndpoint()
  async singUp(@Body() userSignUpDto: UserSignUpDto) {
    return await this.authService.signUp(userSignUpDto)
  }

  @Post('signin')
  @ApiResponse({
    status: 200,
    description: 'Returned JWT token',
    type: String,
  })
  @ApiBody({
    type: UserSignInDto,
  })
  @ApiBadRequestResponse({
    description: 'username or password are invalid',
  })
  async singIn(@Body() userSignInDto: UserSignInDto) {
    return await this.authService.signIn(userSignInDto)
  }
}
