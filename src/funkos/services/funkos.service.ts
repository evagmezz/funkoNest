import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { UpdateFunkoDto } from '../dto/update-funko.dto'
import { Funko } from '../entities/funko.entity'
import { FunkoMapper } from '../mapper/funko-mapper'
import { FunkoDto } from '../dto/funko.dto'

@Injectable()
export class FunkosService {
  private funkoList: FunkoDto[] = []
  private indice: number = 1
  private logger = new Logger('FunkosService')

  constructor(private readonly funkoMapper: FunkoMapper) {}

  async findAll() {
    this.logger.log('Buscando todos los funkos')
    return this.funkoList
  }

  async findOne(id: number) {
    this.logger.log(`Buscando funko con id: ${id}`)
    const funko = this.funkoList.find((funko) => funko.id == id)
    if (funko) {
      return funko
    }
    throw new NotFoundException(`Funko con id: ${id} no encontrado`)
  }

  async create(createFunkoDto: CreateFunkoDto) {
    this.logger.log('Funko creado')
    const funko = new Funko()
    funko.id = this.indice
    funko.name = createFunkoDto.name
    funko.price = createFunkoDto.price
    funko.quantity = createFunkoDto.quantity
    funko.image = createFunkoDto.image
    funko.createdAt = new Date()
    funko.updatedAt = new Date()
    funko.category = createFunkoDto.category
    this.indice++
    const funkoDto = this.funkoMapper.toDto(funko)
    this.funkoList.push(funkoDto)
    return funkoDto
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Actualizando funko con id: ${id}`)
    const funko = await this.findOne(id)
    if (funko) {
      funko.name = updateFunkoDto.name
      funko.price = updateFunkoDto.price
      funko.quantity = updateFunkoDto.quantity
      funko.image = updateFunkoDto.image
      funko.updatedAt = new Date()
      funko.createdAt = funko.createdAt
      funko.category = updateFunkoDto.category
      return this.funkoMapper.toDto(funko)
    }
    throw new NotFoundException(`Funko con id: ${id} no encontrado`)
  }

  async remove(id: number) {
    this.logger.log(`Eliminando funko con id: ${id}`)
    const funko = this.findOne(id)
    if (funko) {
      this.funkoList = this.funkoList.filter((funko) => funko.id != id)
      return funko
    }
    throw new NotFoundException(`Funko con id: ${id} no encontrado`)
  }
}
