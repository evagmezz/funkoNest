import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { OrdersService } from '../services/orders.service'
import { CreateOrderDto } from '../dto/create-order.dto'
import { UpdateOrderDto } from '../dto/update-order.dto'
import { IdValidatePipe } from '../pipes/id-validate.pipe'
import { OrderByValidatePipe } from '../pipes/orderby-validate.pipe'
import { OrderValidatePipe } from '../pipes/order-validate.pipe'
import { ApiExcludeController } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../auth/guards/roles-auth.guard'
import { Roles, RolesAuthGuard } from '../../auth/guards/jwt-auth.guard'

@Controller('api/orders')
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiExcludeController()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles('USER')
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page: number = 1,
    @Query('limit', new DefaultValuePipe(20)) limit: number = 20,
    @Query('orderBy', new DefaultValuePipe('userId'), OrderByValidatePipe)
    orderBy: string = 'userId',
    @Query('order', new DefaultValuePipe('asc'), OrderValidatePipe)
    order: string,
  ) {
    return await this.ordersService.findAll(page, limit, orderBy, order)
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id', IdValidatePipe) id: string) {
    return await this.ordersService.findOne(id)
  }

  @Get('user/:userId')
  @Roles('ADMIN')
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return await this.ordersService.findByUserId(userId)
  }

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(createOrderDto)
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', IdValidatePipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.ordersService.update(id, updateOrderDto)
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(204)
  async remove(@Param('id', IdValidatePipe) id: string) {
    await this.ordersService.remove(id)
  }
}
