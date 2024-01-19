import { Injectable } from '@nestjs/common'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { FunkoDto } from '../dto/funko.dto'
import { plainToClass } from 'class-transformer'
import { Category } from '../../category/entities/category.entity'
import { Funko } from '../entities/funko.entity'

/**
 * Servicio que proporciona métodos para realizar el mapeo entre objetos relacionados con Funkos.
 */
@Injectable()
export class FunkoMapper {
  /**
   * Convierte un objeto CreateFunkoDto y una categoría en una entidad Funko.
   *
   * @param {CreateFunkoDto} createFunkoDto - Datos del Funko a ser creado.
   * @param {Category} category - Categoría a la que pertenece el Funko.
   * @returns {Funko} - Entidad Funko resultante del mapeo.
   */
  toEntity(createFunkoDto: CreateFunkoDto, category: Category): Funko {
    const funko = plainToClass(Funko, createFunkoDto)
    funko.category = category
    return funko
  }

  /**
   * Convierte una entidad Funko en un objeto FunkoDto.
   *
   * @param {Funko} funko - Entidad Funko a ser convertida.
   * @returns {FunkoDto} - Objeto FunkoDto resultante del mapeo.
   */
  toDto(funko: Funko): FunkoDto {
    const funkoDto = plainToClass(FunkoDto, funko)
    if (funko.category && funko.category.name) {
      funkoDto.category = funko.category.name
    }
    return funkoDto
  }
}
