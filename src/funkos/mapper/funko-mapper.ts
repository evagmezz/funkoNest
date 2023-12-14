import { Injectable } from '@nestjs/common'
import { Category, Funko } from '../entities/funko.entity'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { UpdateFunkoDto } from '../dto/update-funko.dto'
import { FunkoDto } from '../dto/funko.dto'

@Injectable()
export class FunkoMapper {
  toEntityCreate(createFunkoDto: CreateFunkoDto, category: Category): Funko {
    const funko = new Funko()
    funko.id = null
    funko.name = createFunkoDto.name
    funko.price = createFunkoDto.price
    funko.quantity = createFunkoDto.quantity
    funko.image = createFunkoDto.image
    funko.createdAt = new Date()
    funko.updatedAt = new Date()
    funko.category = category
    return funko
  }

  toEntityUpdate(
    updateFunkoDto: UpdateFunkoDto,
    category: Category,
    funko: Funko,
  ): Funko {
    funko.id = null
    funko.name = updateFunkoDto.name
    funko.price = updateFunkoDto.price
    funko.quantity = updateFunkoDto.quantity
    funko.image = updateFunkoDto.image
    funko.createdAt = new Date()
    funko.updatedAt = new Date()
    funko.category = category
    return funko
  }

  toDto(funko: Funko): FunkoDto {
    const funkoDto = new FunkoDto()
    funkoDto.id = funko.id
    funkoDto.name = funko.name
    funkoDto.price = funko.price
    funkoDto.quantity = funko.quantity
    funkoDto.image = funko.image
    funkoDto.createdAt = funko.createdAt
    funkoDto.updatedAt = funko.updatedAt
    funkoDto.category = funko.category
    return funkoDto
  }

  toEntity(funkoDto: FunkoDto): Funko {
    const funko = new Funko()
    funko.id = funkoDto.id
    funko.name = funkoDto.name
    funko.price = funkoDto.price
    funko.quantity = funkoDto.quantity
    funko.image = funkoDto.image
    funko.createdAt = funkoDto.createdAt
    funko.updatedAt = funkoDto.updatedAt
    funko.category = funkoDto.category
    return funko
  }
}
