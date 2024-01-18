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

  async findOne(id: string) {
    this.logger.log(`Searching order with id: ${id}`)
    const orderToFind = await this.orderRepository.findById(id).exec()
    if (!orderToFind) {
      throw new NotFoundException(`Order with id: ${id} not found`)
    }
    return orderToFind
  }

  async findByUserId(userId: number) {
    this.logger.log(`Searching order with userId: ${userId}`)
    return await this.orderRepository.find({ userId }).exec()
  }

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

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    this.logger.log(
      `Updating order with id ${id} and ${JSON.stringify(updateOrderDto)}`,
    )
    const orderToUpdate = await this.orderRepository.findById(id).exec()
    if (!orderToUpdate) {
      throw new NotFoundException(`Order with id: ${id} not found`)
    }

    const orderToBeSaved = this.ordersMapper.toEntity(updateOrderDto)

    await this.returnOrderStock(orderToBeSaved)

    await this.checkOrder(orderToBeSaved)
    const orderToSave = await this.reserveOrderStock(orderToBeSaved)

    return await this.orderRepository
      .findByIdAndUpdate(id, orderToSave, { new: true })
      .exec()
  }

  async remove(id: string) {
    this.logger.log(`Deleting order with id ${id}`)

    const order = await this.orderRepository.findById(id).exec()
    if (!order) {
      throw new NotFoundException(`Order with id: ${id} not found`)
    }
    await this.returnOrderStock(order)
    await this.orderRepository.findByIdAndDelete(id).exec()
  }

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
      if (funko.quantity < orderLine.quantity && orderLine.quantity > 0) {
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

  async userExists(userId: number): Promise<boolean> {
    this.logger.log(`Checking if user with id ${userId} exists`)
    const user = await this.userRepository.findOneBy({ id: userId })
    return !!user
  }
}
