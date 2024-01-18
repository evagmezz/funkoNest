import { AuthController } from './controller/auth.controller'
import { AuthService } from './services/auth.service'
import { AuthMapper } from './mapper/auth-mapper'
import { JwtAuthStrategy } from './strategies/jwt-strategy'
import { UsersModule } from '../users/users.module'
import * as process from 'process'
import { PassportModule } from '@nestjs/passport'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    JwtModule.register({
      secret: Buffer.from(
        process.env.TOKEN_SECRET || 'secret',
        'utf-8',
      ).toString('base64'),
      signOptions: {
        expiresIn: Number(process.env.TOKEN_EXPIRES) || 3600,
        algorithm: 'HS512',
      },
    }),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthMapper, JwtAuthStrategy],
})
export class AuthModule {}
