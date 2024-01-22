import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { Order, OrderDocument } from '../schemas/order.schema'
import { Repository } from 'typeorm'
import { PaginateModel } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { InjectRepository } from '@nestjs/typeorm'
import { Funko } from '../../funkos/entities/funko.entity'
import { OrdersMapper } from '../mapper/orders.mapper'
import { CreateOrderDto } from '../dto/create-order.dto'
import { UpdateOrderDto } from '../dto/update-order.dto'
import { User } from '../../users/entities/user.entity'

export const PedidosOrderByValues: string[] = ['_id', 'userId']
export const PedidosOrderValues: string[] = ['asc', 'desc']

/**
 * Servicio encargado de gestionar las operaciones relacionadas con los pedidos.
 */
@Injectable()
export class OrdersService {
  private logger = new Logger(OrdersService.name)

  constructor(
    @InjectModel(Order.name)
    private orderRepository: PaginateModel<OrderDocument>,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    private readonly ordersMapper: OrdersMapper,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Busca todos los pedidos paginados y ordenados según los parámetros proporcionados.
   *
   * @param {number} page - Número de página.
   * @param {number} limit - Límite de resultados por página.
   * @param {string} orderBy - Campo por el cual ordenar los resultados.
   * @param {string} order - Orden de los resultados ('asc' o 'desc').
   * @returns {Promise<any>} - Promesa que resuelve a los resultados paginados y ordenados.
   */
  async findAll(page: number, limit: number, orderBy: string, order: string) {
    this.logger.log(
      `Searching all orders by this params: ${JSON.stringify({
        page,
        limit,
        orderBy,
        order,
      })}`,
    )
    const options = {
      page,
      limit,
      sort: {
        [orderBy]: order,
      },
    }

    return await this.orderRepository.paginate({}, options)
  }

  /**
   * Busca un pedido por su ID.
   *
   * @param {string} id - ID del pedido a buscar.
   * @returns {Promise<OrderDocument>} - Promesa que resuelve al pedido encontrado.
   * @throws {NotFoundException} - Excepción lanzada si el pedido no se encuentra.
   */
  async findOne(id: string) {
    this.logger.log(`Searching order with id: ${id}`)
    const orderToFind = await this.orderRepository.findById(id).exec()
    if (!orderToFind) {
      throw new NotFoundException(`Order with id: ${id} not found`)
    }
    return orderToFind
  }

  /**
   * Busca pedidos por el ID del usuario.
   *
   * @param {number} userId - ID del usuario para el cual buscar pedidos.
   * @returns {Promise<OrderDocument[]>} - Promesa que resuelve a los pedidos encontrados.
   */
  async findByUserId(userId: number) {
    this.logger.log(`Searching order with userId: ${userId}`)
    return await this.orderRepository.find({ userId }).exec()
  }

  /**
   * Crea un nuevo pedido.
   *
   * @param {CreateOrderDto} createOrderDto - Datos para la creación del pedido.
   * @returns {Promise<OrderDocument>} - Promesa que resuelve al pedido creado.
   * @throws {BadRequestException} - Excepción lanzada si hay problemas con los datos del pedido.
   */
  async create(createOrderDto: CreateOrderDto) {
    this.logger.log(`Creating order ${JSON.stringify(createOrderDto)}`)
    console.log(`Saving order: ${createOrderDto}`)

    const orderEntity = this.ordersMapper.toEntity(createOrderDto)

    await this.checkOrder(orderEntity)

    const orderToSave = await this.reserveOrderStock(orderEntity)

    orderToSave.createdAt = new Date()
    orderToSave.updatedAt = new Date()

    return await this.orderRepository.create(orderToSave)
  }

  /**
   * Actualiza un pedido existente.
   *
   * @param {string} id - ID del pedido a actualizar.
   * @param {UpdateOrderDto} updateOrderDto - Datos para la actualización del pedido.
   * @returns {Promise<OrderDocument>} - Promesa que resuelve al pedido actualizado.
   * @throws {NotFoundException} - Excepción lanzada si el pedido no se encuentra.
   */
  async update(id: string, updateOrderDto: UpdateOrderDto) {
    this.logger.log(
      `Updating order with id ${id} and ${JSON.stringify(updateOrderDto)}`,
    )
    const orderToUpdate = await this.orderRepository.findById(id).exec()
    if (!orderToUpdate) {
      throw new NotFoundException(`Order with id: ${id} not found`)
    }

    const orderToBeSaved = this.ordersMapper.toEntity(updateOrderDto)

    await this.checkOrder(orderToBeSaved)

    await this.returnOrderStock(orderToBeSaved)
    const orderToSave = await this.reserveOrderStock(orderToBeSaved)

    return await this.orderRepository
      .findByIdAndUpdate(id, orderToSave, { new: true })
      .exec()
  }

  /**
   * Elimina un pedido por su ID.
   *
   * @param {string} id - ID del pedido a eliminar.
   * @returns {Promise<void>} - Promesa que resuelve una vez eliminado el pedido.
   * @throws {NotFoundException} - Excepción lanzada si el pedido no se encuentra.
   */
  async remove(id: string) {
    this.logger.log(`Deleting order with id ${id}`)

    const order = await this.orderRepository.findById(id).exec()
    if (!order) {
      throw new NotFoundException(`Order with id: ${id} not found`)
    }
    await this.returnOrderStock(order)
    await this.orderRepository.findByIdAndDelete(id).exec()
  }

  /**
   * Verifica la validez de un pedido, asegurándose de que contenga líneas de pedido,
   * que los productos asociados a las líneas existan y tengan suficiente cantidad disponible,
   * y que los precios de los productos coincidan con los precios especificados en las líneas de pedido.
   *
   * @param {Order} order - El pedido a verificar.
   * @returns {Promise<void>} - Promesa que se resuelve si el pedido es válido, de lo contrario, se rechaza con una excepción BadRequestException.
   * @throws {BadRequestException} - Excepción lanzada si el pedido no es válido.
   */
  private async checkOrder(order: Order): Promise<void> {
    this.logger.log(`Cheking order ${JSON.stringify(order)}`)
    if (!order.orderLines || order.orderLines.length === 0) {
      throw new BadRequestException(
        'No order lines have been added to the current order',
      )
    }
    for (const orderLine of order.orderLines) {
      const funko = await this.funkoRepository.findOneBy({
        id: orderLine.funkoId,
      })
      if (!funko) {
        throw new BadRequestException(
          'The funkoId of the order line is not valid',
        )
      }
      if (funko.quantity < orderLine.quantity) {
        throw new BadRequestException(
          `Quantity of funko ${funko.id} is not enough`,
        )
      }
      if (funko.price !== orderLine.funkoPrice) {
        throw new BadRequestException(
          `Funko price and order line price are not the same`,
        )
      }
    }
  }

  /**
   * Reserva el stock de los productos asociados a las líneas de un pedido.
   *
   * @param {Order} order - El pedido para el cual se reserva el stock.
   * @returns {Promise<Order>} - Promesa que resuelve al pedido con el stock reservado.
   * @throws {BadRequestException} - Excepción lanzada si las líneas de pedido están vacías.
   */
  private async reserveOrderStock(order: Order): Promise<Order> {
    this.logger.log(`Reserving stock of order ${JSON.stringify(order)}`)

    if (!order.orderLines || order.orderLines.length === 0) {
      throw new BadRequestException(`Order lines are empty`)
    }

    for (const orderLine of order.orderLines) {
      const funko = await this.funkoRepository.findOneBy({
        id: orderLine.funkoId,
      })
      funko.quantity -= orderLine.quantity
      await this.funkoRepository.save(funko)
      orderLine.total = orderLine.quantity * orderLine.funkoPrice
    }

    order.total = order.orderLines.reduce(
      (sum, orderLine) => sum + orderLine.quantity * orderLine.funkoPrice,
      0,
    )
    order.totalItems = order.orderLines.reduce(
      (sum, orderLine) => sum + orderLine.quantity,
      0,
    )

    return order
  }

  /**
   * Devuelve el stock de los productos asociados a las líneas de un pedido.
   *
   * @param {Order} order - El pedido para el cual se devuelve el stock.
   * @returns {Promise<Order>} - Promesa que resuelve al pedido con el stock devuelto.
   */

  private async returnOrderStock(order: Order): Promise<Order> {
    this.logger.log(`Returning stock of order ${JSON.stringify(order)}`)
    if (order.orderLines) {
      for (const orderLine of order.orderLines) {
        const funko = await this.funkoRepository.findOneBy({
          id: orderLine.funkoId,
        })
        funko.quantity += orderLine.quantity
        await this.funkoRepository.save(funko)
      }
    }
    return order
  }

  /**
   * Verifica si un usuario con el ID proporcionado existe en el sistema.
   *
   * @param {number} userId - ID del usuario a verificar.
   * @returns {Promise<boolean>} - Promesa que resuelve a `true` si el usuario existe, de lo contrario, resuelve a `false`.
   */
  async userExists(userId: number): Promise<boolean> {
    this.logger.log(`Checking if user with id ${userId} exists`)
    const user = await this.userRepository.findOneBy({ id: userId })
    return !!user
  }
}
