import { Test, TestingModule } from '@nestjs/testing'
import { CategoryService } from './category.service'
import { Repository } from 'typeorm'
import { Category } from '../entities/category.entity'
import { CategoryMapper } from '../mapper/category-mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { NotFoundException } from '@nestjs/common'

describe('CategoryService', () => {
  let service: CategoryService
  let repository: Repository<Category>
  let mapper: CategoryMapper

  const mapperMock = {
    toEntity: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService, { provide: CategoryMapper, useValue: mapperMock }, {
        provide: getRepositoryToken(Category),
        useClass: Repository,
      }],
    }).compile()

    service = module.get<CategoryService>(CategoryService)
    repository = module.get<Repository<Category>>(
      getRepositoryToken(Category))
    mapper = module.get<CategoryMapper>(CategoryMapper)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = [new Category()]
      jest.spyOn(repository, 'find').mockResolvedValue(categories)
      expect(await service.findAll()).toEqual(categories)
    })
  })
  describe('findOne', () => {
    it('should create a category', async () => {
      const category = new Category()
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category)
      expect(await service.findOne('d69cf3db-b77d-4181-b3cd-5ca8107fb6a7')).toBe(category)
    })
    it('should throw a Not Found Exception', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined)
      await expect(service.findOne('d69cf3db-b77d-4181-b3cd-5ca8107fb6a7')).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('should return a category', async () => {
      const category = new Category()
      category.name = 'MARVEL'

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQuery as any)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)
      jest.spyOn(service, 'categoryExists').mockResolvedValue(null)

      expect(await service.create(new CreateCategoryDto())).toBe(category)
      expect(repository.save).toHaveBeenCalled()
      expect(mapper.toEntity).toHaveBeenCalled()
    })
  })
  describe('update', () => {
    it('should update a category', async () => {
      const category = new Category()
      category.name = 'MARVEL'

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }
      const mockUpdateCategoryDto = new UpdateCategoryDto()

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQuery as any)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)
      jest.spyOn(service, 'categoryExists').mockResolvedValue(null)

      const result = await service.update('d69cf3db-b77d-4181-b3cd-5ca8107fb6a7', mockUpdateCategoryDto)
      expect(result).toBe(category)
    })
  })
  describe('remove', () => {
    it('should remove a category', async () => {
      const category = new Category()

      jest.spyOn(service, 'categoryExists').mockResolvedValue(category)
      jest.spyOn(repository, 'remove').mockResolvedValue(category)

      const result = await service.remove('uuid')
      expect(result).toEqual(category)
    })
    it('should throw a Not Found Exception', async () => {
      jest.spyOn(service, 'categoryExists').mockReturnValue(null)
      await expect(service.remove('uuid')).rejects.toThrow(NotFoundException)
    })
  })

  describe('changeIsActive', () => {
    it('should change isActive to false', async () => {
      const category = new Category()
      category.name = 'MARVEL'
      category.isActive = true

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQuery as any)
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)

      const result = await service.changeIsActive('d69cf3db-b77d-4181-b3cd-5ca8107fb6a7')
      expect(result).toEqual(category)
    })
    it('should throw a Not Found Exception', async () => {
      jest.spyOn(repository, 'findOneBy').mockReturnValue(null)
      await expect(service.changeIsActive('d69cf3db-b77d-4181-b3cd-5ca8107fb6a7')).rejects.toThrow(NotFoundException)
    })
  })
})
