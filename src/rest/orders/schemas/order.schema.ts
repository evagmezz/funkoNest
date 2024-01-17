import { Client } from './client.schema'
import { OrderLine } from './orderLine.schema'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'

export type OrderDocument = Order & Document

@Schema({
  collection: 'orders',
  timestamps: true,
  versionKey: false,
  id: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id
      ret.id = ret._id
      delete ret._id
      delete ret._class
    },
  },
})
export class Order {
  @Prop({
    type: Number,
    required: true,
  })
  userId: number

  @Prop({
    required: true,
  })
  client: Client

  @Prop({
    required: true,
  })
  orderLines: OrderLine[]

  @Prop()
  totalItems: number

  @Prop()
  total: number

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date

  @Prop({
    type: Date,
    default: Date.now,
  })
  updatedAt: Date

  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted: boolean
}

export const OrderSchema = SchemaFactory.createForClass(Order)
OrderSchema.plugin(mongoosePaginate)
