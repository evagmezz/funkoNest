import { Prop } from '@nestjs/mongoose'

export class Address {
  @Prop({
    type: String,
    required: true,
    length: 100,
    default: '',
  })
  street: string
  @Prop({
    type: Number,
    required: true,
    length: 50,
    default: 0,
  })
  number: number

  @Prop({
    type: String,
    required: true,
    length: 100,
    default: '',
  })
  city: string

  @Prop({
    type: String,
    required: true,
    length: 100,
    default: '',
  })
  province: string

  @Prop({
    type: String,
    required: true,
    length: 100,
    default: '',
  })
  country: string

  @Prop({
    type: Number,
    required: true,
    length: 50,
    default: 0,
  })
  zip: number
}
