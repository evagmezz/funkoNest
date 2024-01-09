import { Injectable } from '@nestjs/common'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { FunkoDto } from '../dto/funko.dto'
import { plainToClass } from 'class-transformer'
import { Category } from '../../category/entities/category.entity'
import { Funko } from '../entities/funko.entity'

@Injectable()
export class FunkoMapper {
  toEntity(createFunkoDto: CreateFunkoDto, category: Category): Funko {
    const funko = plainToClass(Funko, createFunkoDto)
    funko.category = category
    return funko
  }

  toDto(funko: Funko): FunkoDto {
    const funkoDto = plainToClass(FunkoDto, funko)
    if (funko.category && funko.category.name) {
      funkoDto.category = funko.category.name
    }
    return funkoDto
  }
}
