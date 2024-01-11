import { Test, TestingModule } from '@nestjs/testing'
import { FunkosController } from './funkos.controller'
import { FunkosService } from '../services/funkos.service'
import { FunkoDto } from '../dto/funko.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { UpdateFunkoDto } from '../dto/update-funko.dto'
import { CacheModule } from '@nestjs/cache-manager'

describe('FunkosController', () => {
  let controller: FunkosController
  let service: FunkosService

  const funkoServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    isDeletedToTrue: jest.fn(),
    updateImage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [FunkosController],
      providers: [{ provide: FunkosService, useValue: funkoServiceMock }],
    }).compile()

    controller = module.get<FunkosController>(FunkosController)
    service = module.get<FunkosService>(FunkosService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('findAll', () => {
    it('should return an array of funkos', async () => {
      const result: Array<FunkoDto> = []
      jest.spyOn(service, 'findAll').mockResolvedValue(result)
      const funkos = await controller.findAll()
      expect(funkos).toBeInstanceOf(Array)
      expect(service.findAll).toHaveBeenCalled()
    })
  })
  describe('findOne', () => {
    it('should return a funko', async () => {
      const id = 1
      const result: FunkoDto = new FunkoDto()
      jest.spyOn(service, 'findOne').mockResolvedValue(result)
      await controller.findOne(id)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(result).toBeInstanceOf(FunkoDto)
    })
    it('should throw a NotFoundException', async () => {
      const id = 1
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('should create a funko', async () => {
      const createFunkoDto: CreateFunkoDto = {
        name: 'Spiderman',
        price: 100,
        quantity: 10,
        image: 'image.png',
        isDeleted: false,
        category: 'category',
      }
      const result: FunkoDto = new FunkoDto()
      jest.spyOn(service, 'create').mockResolvedValue(result)
      await controller.create(createFunkoDto)
      expect(service.create).toHaveBeenCalledWith(createFunkoDto)
      expect(result).toBeInstanceOf(FunkoDto)
    })
  })
  describe('update', () => {
    it('should update a funko', async () => {
      const id = 1
      const updateFunkoDto: UpdateFunkoDto = {
        name: 'Spiderman',
        price: 100,
        isDeleted: false,
      }
      const result: FunkoDto = new FunkoDto()
      jest.spyOn(service, 'update').mockResolvedValue(result)
      await controller.update(id, updateFunkoDto)
      expect(service.update).toHaveBeenCalledWith(id, updateFunkoDto)
      expect(result).toBeInstanceOf(FunkoDto)
    })
  })
  describe('remove', () => {
    it('should delete a funko', async () => {
      const id = 1
      const result = new FunkoDto()
      jest.spyOn(service, 'isDeletedToTrue').mockResolvedValue(result)
      await controller.remove(id)
      expect(service.isDeletedToTrue).toHaveBeenCalledWith(id)
      expect(result).toBeInstanceOf(FunkoDto)
    })
    it('should throw a NotFoundException', async () => {
      const id = 1
      jest
        .spyOn(service, 'isDeletedToTrue')
        .mockRejectedValue(new NotFoundException())
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
    })
  })
  describe('updateImage', () => {
    it('should update a funko image', async () => {
      const id = 1
      const mockResult: FunkoDto = new FunkoDto()
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'image',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'destination',
        filename: 'filename',
        path: 'path',
        size: 1,
        stream: null,
        buffer: null,
      }
      jest.spyOn(service, 'updateImage').mockResolvedValue(mockResult)
      await controller.updateImage(id, mockFile)
      expect(service.updateImage).toHaveBeenCalledWith(id, mockFile)
      expect(mockResult).toBeInstanceOf(FunkoDto)
    })
    it('bad request file too large', async () => {
      const id = 1
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'image',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'destination',
        filename: 'filename',
        path: 'path',
        size: 10000000,
        stream: null,
        buffer: null,
      }
      jest
        .spyOn(service, 'updateImage')
        .mockRejectedValue(new BadRequestException())
      await expect(controller.updateImage(id, mockFile)).rejects.toThrow(
        BadRequestException,
      )
    })
    it('bad request file not image', async () => {
      const id = 1
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'image',
        encoding: '7bit',
        mimetype: 'text/plain',
        destination: 'destination',
        filename: 'filename',
        path: 'path',
        size: 1,
        stream: null,
        buffer: null,
      }
      jest
        .spyOn(service, 'updateImage')
        .mockRejectedValue(new BadRequestException())
      await expect(controller.updateImage(id, mockFile)).rejects.toThrow(
        BadRequestException,
      )
    })
    it('should throw an error if funko not found', async () => {
      const id = 1
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'image',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'destination',
        filename: 'filename',
        path: 'path',
        size: 1,
        stream: null,
        buffer: null,
      }
      jest
        .spyOn(service, 'updateImage')
        .mockRejectedValue(new NotFoundException())
      await expect(controller.updateImage(id, mockFile)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
