import { Address } from './address.schema'
import { Prop } from '@nestjs/mongoose'

export class Client {
  @Prop({
    type: String,
    required: true,
    length: 100,
    default: '',
  })
  name: string

  @Prop({
    type: String,
    required: true,
    length: 100,
    default: '',
  })
  email: string

  @Prop({
    type: Number,
    required: true,
    length: 100,
    default: 0,
  })
  phone: number

  @Prop({
    required: true,
  })
  address: Address
}
