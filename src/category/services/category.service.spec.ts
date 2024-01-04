import { Test, TestingModule } from '@nestjs/testing'
import { CategoryService } from './category.service'
import { Repository } from 'typeorm'
import { Category } from '../entities/category.entity'
import { CategoryMapper } from '../mapper/category-mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('CategoryService', () => {
  let service: CategoryService
  let repository: Repository<Category>
  let mapper: CategoryMapper

  const mapperMock = {
    toEntity: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CategoryMapper, useValue: mapperMock },
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<CategoryService>(CategoryService)
    repository = module.get<Repository<Category>>(getRepositoryToken(Category))
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
      expect(
        await service.findOne('d69cf3db-b77d-4181-b3cd-5ca8107fb6a7'),
      ).toBe(category)
    })
    it('should throw a NotFoundException', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined)
      await expect(
        service.findOne('d69cf3db-b77d-4181-b3cd-5ca8107fb6a7'),
      ).rejects.toThrow(NotFoundException)
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
      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)
      jest.spyOn(service, 'categoryExists').mockResolvedValue(null)

      expect(await service.create(new CreateCategoryDto())).toBe(category)
      expect(repository.save).toHaveBeenCalled()
      expect(mapper.toEntity).toHaveBeenCalled()
    })
    it('should throw a BadRequestException because of empty  name', async () => {
      const createCategory = new CreateCategoryDto()
      createCategory.name = ''
      await expect(service.create(createCategory)).rejects.toThrow(TypeError)
    })
  })
  describe('update', () => {
    it('should update a category', async () => {
      const category = new Category()
      category.name = 'PC'

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }
      const updateCategory = new UpdateCategoryDto()

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)

      const result = await service.update('uuid', updateCategory)
      expect(result).toEqual(category)
    })
    it('should throw a BadRequestException because of empty name', async () => {
      const createCategory = new CreateCategoryDto()
      createCategory.name = ''
      await expect(service.create(createCategory)).rejects.toThrow(TypeError)
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
    it('should throw a NotFoundException', async () => {
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

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)

      const result = await service.changeIsActive(
        'd69cf3db-b77d-4181-b3cd-5ca8107fb6a7',
      )
      expect(result).toEqual(category)
    })
    it('should throw a NotFoundException', async () => {
      jest.spyOn(repository, 'findOneBy').mockReturnValue(null)
      await expect(
        service.changeIsActive('d69cf3db-b77d-4181-b3cd-5ca8107fb6a7'),
      ).rejects.toThrow(NotFoundException)
    })
  })
  describe('categoryExists', () => {
    it('should create and return a new category if not exists', async () => {
      const newCategory = new Category()
      newCategory.name = 'PC'
      newCategory.isActive = true

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(repository, 'save').mockResolvedValue(newCategory)

      const result = await service.categoryExists('PC')
      expect(result).toEqual(newCategory)
    })

    it('should activate and return an inactive category', async () => {
      const existingCategory = new Category()
      existingCategory.name = 'PC'
      existingCategory.isActive = false

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(existingCategory),
      }

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(repository, 'save').mockResolvedValue(existingCategory)

      const result = await service.categoryExists('PC')
      expect(result).toEqual(existingCategory)
      expect(existingCategory.isActive).toBe(true)
    })
    it('should throw BadRequestException if category is already active', async () => {
      const existingCategory = new Category()
      existingCategory.name = 'PC'
      existingCategory.isActive = true

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(existingCategory),
      }
      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(repository, 'save').mockResolvedValue(existingCategory)
      await expect(service.categoryExists('PC')).rejects.toThrow(
        BadRequestException,
      )
    })
  })
})
