import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { UpdateFunkoDto } from '../dto/update-funko.dto'
import { Funko } from '../entities/funko.entity'

@Injectable()
export class FunkosService {
  private funkoList: Funko[] = []
  private indice: number = 1
  private logger = new Logger('FunkosService')

  findAll() {
    this.logger.log('Buscando todos los funkos')
    return this.funkoList
  }

  findOne(id: number) {
    this.logger.log(`Buscando funko con id: ${id}`)
    const funko = this.funkoList.find((funko) => funko.id == id)
    if (funko) {
      return funko
    }
    throw new HttpException('Funko no encontrado', HttpStatus.NOT_FOUND)
  }

  create(createFunkoDto: CreateFunkoDto) {
    this.logger.log('Funko creado')
    const funko = new Funko()
    funko.id = this.indice
    funko.name = createFunkoDto.name
    funko.categoria = createFunkoDto.categoria
    this.indice++
    this.funkoList.push(funko)
    return funko
  }

  update(id: number, updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Actualizando funko con id: ${id}`)
    const funko = this.findOne(id)
    if (funko) {
      funko.name = updateFunkoDto.name
      funko.categoria = updateFunkoDto.categoria
      return funko
    }
    throw new HttpException('Funko no encontrado', HttpStatus.NOT_FOUND)
  }

  remove(id: number) {
    this.logger.log(`Eliminando funko con id: ${id}`)
    const funko = this.findOne(id)
    if (funko) {
      this.funkoList = this.funkoList.filter((funko) => funko.id != id)
      return funko
    }
    throw new HttpException('Funko no encontrado', HttpStatus.NOT_FOUND)
  }
}
