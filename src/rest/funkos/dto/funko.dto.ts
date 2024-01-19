import { ApiProperty } from '@nestjs/swagger'

export class FunkoDto {
  @ApiProperty({ example: 1, description: 'Funko id' })
  id: number

  @ApiProperty({ example: 'Spiderman', description: 'Funko name' })
  name: string

  @ApiProperty({ example: 100, description: 'Funko price' })
  price: number

  @ApiProperty({ example: 10, description: 'Funko quantity' })
  quantity: number

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Funko image',
  })
  image: string

  @ApiProperty({
    example: false,
    description: 'Funko is deleted status',
  })
  isDeleted: boolean

  @ApiProperty({
    example: 'Marvel',
    description: 'Funko category',
  })
  category: string
}
