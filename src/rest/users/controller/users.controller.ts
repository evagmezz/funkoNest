import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { UsersService } from '../services/users.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import { IdValidatePipe } from '../../orders/pipes/id-validate.pipe'
import { CreateOrderDto } from '../../orders/dto/create-order.dto'
import { UpdateOrderDto } from '../../orders/dto/update-order.dto'
import { JwtAuthGuard } from '../../auth/guards/roles-auth.guard'
import { Roles, RolesAuthGuard } from '../../auth/guards/jwt-auth.guard'

@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  async findAll() {
    return await this.usersService.findAll()
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(id: number) {
    return await this.usersService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto)
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto, true)
  }

  @Get('me/porfile')
  @Roles('USER')
  async getPorfile(@Req() request: any) {
    return request.user
  }

  @Delete('me/porfile')
  @HttpCode(204)
  @Roles('USER')
  async deletePorfile(@Req() request: any) {
    return await this.usersService.deleteById(request.user.id)
  }

  @Put('me/porfile')
  @Roles('USER')
  async updatePorfile(
    @Req() request: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(request.user.id, updateUserDto, false)
  }

  @Get('me/orders')
  async getOrders(@Req() request: any) {
    return await this.usersService.getOrders(request.user.id)
  }

  @Get('me/orders/:id')
  async getOrder(@Req() request: any, @Param('id', IdValidatePipe) id: string) {
    return await this.usersService.getOrder(request.user.id, id)
  }

  @Post('me/orders')
  @HttpCode(201)
  @Roles('USER')
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() request: any,
  ) {
    return await this.usersService.createOrder(createOrderDto, request.user.id)
  }

  @Put('me/orders/:id')
  @Roles('USER')
  async updateOrder(
    @Param('id', IdValidatePipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() request: any,
  ) {
    return await this.usersService.updateOrder(
      id,
      updateOrderDto,
      request.user.id,
    )
  }

  @Delete('me/orders/:id')
  @HttpCode(204)
  @Roles('USER')
  async removeOrder(
    @Param('id', IdValidatePipe) id: string,
    @Req() request: any,
  ) {
    await this.usersService.removeOrder(id, request.user.id)
  }
}
