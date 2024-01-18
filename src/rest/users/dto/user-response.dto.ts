export class UserDto {
  id: number
  name: string
  lastName: string
  email: string
  username: string
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  roles: string[]
}
