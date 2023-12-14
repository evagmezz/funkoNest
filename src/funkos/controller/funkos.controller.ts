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
} from '@nestjs/common'
import { FunkosService } from '../services/funkos.service'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { UpdateFunkoDto } from '../dto/update-funko.dto'

@Controller('api/funkos')
export class FunkosController {
  constructor(private readonly funkosService: FunkosService) {}

  @Get()
  findAll() {
    return this.funkosService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.funkosService.findOne(id)
  }

  @Post()
  create(@Body() createFunkoDto: CreateFunkoDto) {
    return this.funkosService.create(createFunkoDto)
  }

  @Put(':id')
  @HttpCode(201)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    return this.funkosService.update(id, updateFunkoDto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.funkosService.remove(id)
  }
}
