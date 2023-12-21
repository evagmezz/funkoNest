import { Test, TestingModule } from '@nestjs/testing'
import { CategoryMapper } from './category-mapper'

describe('Category', () => {
  let mapper: CategoryMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryMapper],
    }).compile()

    mapper = module.get<CategoryMapper>(CategoryMapper)
  })

  it('should be defined', () => {
    expect(mapper).toBeDefined()
  })

  it('should turn a CreateCategoryDto into a Category', () => {
    const createCategoryDto = {
      name: 'name',
    }
    const category = {
      id: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a7',
      name: 'name',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      funkos: [],
    }
    const actualCategory = mapper.toEntity(createCategoryDto)
    expect(actualCategory.name).toEqual(category.name)
  })
  it('should turn a UpdateCategoryDto into a Category', () => {
    const updateCategoryDto = {
      name: 'name',
      isActive: false,
    }
    const category = {
      id: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a7',
      name: 'name',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: false,
      funkos: [],
    }
    const actualCategory = mapper.toEntity(updateCategoryDto)
    expect(actualCategory.name).toEqual(category.name)
    expect(actualCategory.isActive).toEqual(category.isActive)
  })
})
