import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateOrderDto } from '../dto/create-order.dto'
import { Order } from '../schemas/order.schema'

/**
 * Servicio encargado de mapear los datos de la orden.
 */
@Injectable()
export class OrdersMapper {
  /**
   * Convierte un objeto de tipo CreateOrderDto a una instancia de la clase Order.
   *
   * @param {CreateOrderDto} createOrderDto - Datos de la orden a ser mapeados.
   * @returns {Order} - Instancia de la clase Order creada a partir de los datos proporcionados.
   */
  toEntity(createOrderDto: CreateOrderDto): Order {
    return plainToClass(Order, createOrderDto)
  }
}
