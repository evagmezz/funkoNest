import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNotEmpty,
  Matches,
} from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  lastName: string
  @IsNotEmpty({ message: 'Username cannot be empty' })
  username: string
  @IsEmail({}, { message: 'Email must be a valid email' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string
  @IsArray({ message: 'The roles must be an array' })
  @ArrayNotEmpty({ message: 'The roles cannot be empty' })
  roles: string[]
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Invalid password. It must contain at least 8 characters, one uppercase letter, one lowercase letter and one number',
  })
  password: string
}
