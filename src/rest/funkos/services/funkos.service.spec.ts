import { Test, TestingModule } from '@nestjs/testing'
import { FunkosService } from './funkos.service'
import { Repository } from 'typeorm'
import { Funko } from '../entities/funko.entity'
import { Category } from '../../category/entities/category.entity'
import { FunkoMapper } from '../mapper/funko-mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { FunkoDto } from '../dto/funko.dto'
import { NotFoundException } from '@nestjs/common'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { UpdateFunkoDto } from '../dto/update-funko.dto'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { NotificationsModule } from '../../../websockets/notifications/notifications.module'
import { StorageService } from '../../storage/services/storage.service'

describe('FunkosService', () => {
  let service: FunkosService
  let funkoRepository: Repository<Funko>
  let categoryRepository: Repository<Category>
  let mapper: FunkoMapper
  let cacheManager: Cache
  let storageService: StorageService

  const mapperMock = {
    toDto: jest.fn(),
    toEntity: jest.fn(),
  }
  const storageServiceMock = {
    removeFile: jest.fn(),
    getFileNameWithouUrl: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NotificationsModule],
      providers: [
        FunkosService,
        { provide: getRepositoryToken(Funko), useClass: Repository },
        { provide: getRepositoryToken(Category), useClass: Repository },
        { provide: FunkoMapper, useValue: mapperMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()

    service = module.get<FunkosService>(FunkosService)
    funkoRepository = module.get<Repository<Funko>>(getRepositoryToken(Funko))
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    )
    mapper = module.get<FunkoMapper>(FunkoMapper)
    storageService = module.get<StorageService>(StorageService)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('findAll', () => {
    it('should return an array of funkos', async () => {
      const funkosDto: FunkoDto[] = []
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(funkosDto),
      }
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)

      jest.spyOn(mapper, 'toDto').mockReturnValue(funkosDto[0])
      expect(await service.findAll()).toEqual(funkosDto)
      expect(cacheManager.get).toHaveBeenCalled()
      expect(cacheManager.set).toHaveBeenCalled()
    })
  })
  describe('findOne', () => {
    it('should return a funko', async () => {
      const funkoDto = new FunkoDto()
      jest.spyOn(cacheManager, 'get').mockResolvedValue(funkoDto)
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(funkoDto),
      }

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))

      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(mapper, 'toDto').mockReturnValue(funkoDto)
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      expect(await service.findOne(1)).toEqual(funkoDto)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('should create a funko', async () => {
      const createFunkoDto = new CreateFunkoDto()
      const category = new Category()
      const funko = new Funko()
      const funkoDto = new FunkoDto()

      jest.spyOn(service, 'checkCategory').mockResolvedValue(category)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(funko)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      jest.spyOn(funkoRepository, 'save').mockResolvedValue(funko)
      jest.spyOn(mapper, 'toDto').mockReturnValue(funkoDto)
      expect(await service.create(createFunkoDto)).toEqual(funkoDto)
    })
    it('should throw a BadRequestException because of empty name', async () => {
      const createFunkoDto = new CreateFunkoDto()
      createFunkoDto.name = ''
      await expect(service.create(createFunkoDto)).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequestException because of empty price', async () => {
      const createFunkoDto = new CreateFunkoDto()
      createFunkoDto.price = undefined
      await expect(service.create(createFunkoDto)).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequestException because of empty quantity', async () => {
      const createFunkoDto = new CreateFunkoDto()
      createFunkoDto.quantity = undefined
      await expect(service.create(createFunkoDto)).rejects.toThrow(TypeError)
    })
  })
  describe('update', () => {
    it('should update a funko', async () => {
      const updateFunkoDto = new UpdateFunkoDto()
      const funko = new Funko()
      const category = new Category()
      const funkoDto = new FunkoDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(funko),
      }
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(service, 'checkCategory').mockResolvedValue(category)
      jest.spyOn(funkoRepository, 'save').mockResolvedValue(funko)
      jest.spyOn(mapper, 'toDto').mockReturnValue(funkoDto)

      expect(await service.update(1, updateFunkoDto)).toEqual(funkoDto)
    })
    it('should throw a BadRequestException because of empty name', async () => {
      const updateFunkoDto = new UpdateFunkoDto()
      updateFunkoDto.name = ''
      await expect(service.update(1, updateFunkoDto)).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequestException because of empty price', async () => {
      const updateFunkoDto = new UpdateFunkoDto()
      updateFunkoDto.price = undefined
      await expect(service.update(1, updateFunkoDto)).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequestException because of empty quantity', async () => {
      const updateFunkoDto = new UpdateFunkoDto()
      updateFunkoDto.quantity = undefined
      await expect(service.update(1, updateFunkoDto)).rejects.toThrow(TypeError)
    })
  })
  describe('remove', () => {
    it('should remove a funko', async () => {
      const funko = new Funko()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(funko),
      }
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(funkoRepository, 'delete').mockResolvedValue(undefined)

      expect(await service.remove(1)).toEqual(undefined)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.remove(1)).rejects.toThrow(NotFoundException)
    })
  })
  describe('isDeletedToTrue', () => {
    it('should set isDeleted to true', async () => {
      const funko = new Funko()
      const funkoDto = new FunkoDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(funko),
      }
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(funkoRepository, 'save').mockResolvedValue(funko)
      jest.spyOn(mapper, 'toDto').mockReturnValue(funkoDto)

      expect(await service.isDeletedToTrue(1)).toEqual(funkoDto)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.isDeletedToTrue(1)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
  describe('checkCategory', () => {
    it('should return a category', async () => {
      const category = new Category()
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }
      jest
        .spyOn(categoryRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      expect(await service.checkCategory('1')).toEqual(category)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(categoryRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.checkCategory('1')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
  describe('updateImg', () => {
    it('should update the image of a funko', async () => {})
  })
})
