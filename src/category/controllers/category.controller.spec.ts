import { Test, TestingModule } from '@nestjs/testing'
import { CategoryController } from './category.controller'
import { CategoryService } from '../services/category.service'
import { Category } from '../entities/category.entity'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('CategoryController', () => {
  let controller: CategoryController
  let service: CategoryService
  const mockCategoryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    changeIsActive: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockCategoryService }],
    }).compile()

    controller = module.get<CategoryController>(CategoryController)
    service = module.get<CategoryService>(CategoryService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const result: Array<Category> = []
      jest.spyOn(service, 'findAll').mockResolvedValue(result)
      await controller.findAll()
      expect(result).toBeInstanceOf(Array)
      expect(service.findAll).toHaveBeenCalled()
    })
  })
  describe('findOne', () => {
    it('should return a category', async () => {
      const id = 'uuid'
      const result: Category = new Category()
      jest.spyOn(service, 'findOne').mockResolvedValue(result)
      await controller.findOne(id)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(result).toBeInstanceOf(Category)
    })
    it('should throw a NotFoundException', async () => {
      const id = 'uuid'
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('should create a category', async () => {
      const result: Category = new Category()
      const category = new Category()
      jest.spyOn(service, 'create').mockResolvedValue(result)
      await controller.create(category)
      expect(service.create).toHaveBeenCalledWith(category)
      expect(result).toBeInstanceOf(Category)
    })
  })
  describe('update', () => {
    it('should update a category', async () => {
      const id = 'uuid'
      const result: Category = new Category()
      const category = new Category()
      jest.spyOn(service, 'update').mockResolvedValue(result)
      await controller.update(id, category)
      expect(service.update).toHaveBeenCalledWith(id, category)
      expect(result).toBeInstanceOf(Category)
    })
  })
  describe('changeIsActive', () => {
    it('should change isActive to false', async () => {
      const id = 'uuid'
      const result: Category = new Category()
      jest.spyOn(service, 'changeIsActive').mockResolvedValue(result)
      await controller.remove(id)
      expect(service.changeIsActive).toHaveBeenCalledWith(id)
      expect(result).toBeInstanceOf(Category)
    })
    it('should throw a NotFoundException', async () => {
      const id = 'uuid'
      jest
        .spyOn(service, 'changeIsActive')
        .mockRejectedValue(new NotFoundException())
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
    })
  })
})
