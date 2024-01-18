import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator'

export class UserSignUpDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Invalid name' })
  name: string

  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @IsString({ message: 'Invalid last name' })
  lastName: string

  @IsNotEmpty({ message: 'Username cannot be empty' })
  @IsString({ message: 'Invalid username' })
  username: string

  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string

  @IsString({ message: 'Password no es válido' })
  @IsNotEmpty({ message: 'Password no puede estar vacío' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Invalid password. It must contain at least 8 characters, one uppercase letter, one lowercase letter and one number',
  })
  password: string
}
