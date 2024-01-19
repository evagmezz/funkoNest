import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UserSignInDto {
  @ApiProperty({ example: 'admin', description: 'Username' })
  @IsNotEmpty({ message: 'Username cannot be empty' })
  username: string

  @ApiProperty({ example: 'admin', description: 'Password' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string
}
