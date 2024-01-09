import { Test, TestingModule } from '@nestjs/testing'
import { FunkoMapper } from './funko-mapper'
import { Funko } from '../entities/funko.entity'
import { FunkoDto } from '../dto/funko.dto'
import { CreateFunkoDto } from '../dto/create-funko.dto'

describe('FunkoMapper', () => {
  let mapper: FunkoMapper

  const category = {
    id: 'uuid',
    name: 'Marvel',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    funkos: [],
  }
  const funko = {
    id: 1,
    name: 'Spiderman',
    price: 100,
    quantity: 10,
    image: 'image.png',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    category: category,
  }
  const createFunkoDto: CreateFunkoDto = {
    name: 'Spiderman',
    price: 100,
    quantity: 10,
    image: 'image.png',
    isDeleted: false,
    category: category.name,
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunkoMapper],
    }).compile()

    mapper = module.get<FunkoMapper>(FunkoMapper)
  })

  it('should be defined', () => {
    expect(mapper).toBeDefined()
  })
  it('should map dto to entity', () => {
    const expectedFunko = {
      ...funko,
      category: category,
    }
    const actualFunko = mapper.toEntity(createFunkoDto, category)
    expect(actualFunko).toBeInstanceOf(Funko)
    expect(actualFunko.name).toEqual(expectedFunko.name)
  })
  it('should map entity to dto', () => {
    const expectedFunkoDto = {
      ...funko,
      category: category.name,
    }
    const actualFunkoDto = mapper.toDto(funko)
    expect(actualFunkoDto).toBeInstanceOf(FunkoDto)
    expect(actualFunkoDto.name).toEqual(expectedFunkoDto.name)
  })
})
