import { Prop } from '@nestjs/mongoose'

export class OrderLine {
  @Prop({
    type: Number,
    required: true,
  })
  quantity: number

  @Prop({
    type: Number,
    required: true,
  })
  funkoId: number

  @Prop({
    type: Number,
    required: true,
  })
  funkoPrice: number

  @Prop({
    type: Number,
    required: true,
  })
  total: number
}
