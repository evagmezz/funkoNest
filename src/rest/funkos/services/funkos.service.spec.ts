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
import { NotificationsGateway } from '../../../websockets/notifications/notifications.gateway'
import { Paginated } from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'

describe('FunkosService', () => {
  let service: FunkosService
  let funkoRepository: Repository<Funko>
  let categoryRepository: Repository<Category>
  let mapper: FunkoMapper
  let cacheManager: Cache
  let storageService: StorageService
  let notification: NotificationsGateway

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

  const notificationMock = {
    sendMessage: jest.fn(),
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
        { provide: NotificationsGateway, useValue: notificationMock },
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
    notification = module.get<NotificationsGateway>(NotificationsGateway)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('findAll', () => {
    it('should return an array of funkos', async () => {
      const paginateOptions = {
        page: 1,
        limit: 3,
        path: 'http://localhost:3000/api/funkos',
      }
      const page: any = {
        data: [],
        meta: {
          itemsPerPage: 3,
          totalItems: 19,
          totalPages: 7,
          currentPage: 1,
        },
        links: {
          current:
            'http://localhost:3000/api/funkos?page=1&limit=3&sortBy=id:ASC',
        },
      } as Paginated<FunkoDto>
      jest.spyOn(cacheManager, 'get').mockResolvedValue(page)
      const result: any = await service.findAll(paginateOptions)

      expect(cacheManager.get).toHaveBeenCalledWith(
        `all_funkos_page_${hash(JSON.stringify(paginateOptions))}`,
      )
      expect(result).toEqual(page)
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

      jest.spyOn(cacheManagerMock.store, 'keys').mockResolvedValue([])
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(mapper, 'toDto').mockReturnValue(funkoDto)
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      expect(await service.findOne(1)).toEqual(funkoDto)
    })
  })
  describe('create', () => {
    it('should create a funko', async () => {
      const createFunkoDto = new CreateFunkoDto()
      const category = new Category()
      const funko = new Funko()
      const funkoDto = new FunkoDto()

      jest.spyOn(notificationMock, 'sendMessage').mockResolvedValue('CREATE')
      jest.spyOn(service, 'checkCategory').mockResolvedValue(category)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(funko)
      jest.spyOn(notification, 'sendMessage').mockImplementation()
      jest.spyOn(mapper, 'toDto').mockReturnValue(funkoDto)
      jest.spyOn(cacheManagerMock.store, 'keys').mockResolvedValue([])
      jest.spyOn(funkoRepository, 'save').mockResolvedValue(funko)

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

      jest.spyOn(notificationMock, 'sendMessage').mockResolvedValue('UPDATE')
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(service, 'checkCategory').mockResolvedValue(category)
      jest.spyOn(funkoRepository, 'save').mockResolvedValue(funko)
      jest.spyOn(mapper, 'toDto').mockReturnValue(funkoDto)
      jest.spyOn(notification, 'sendMessage').mockImplementation()
      jest.spyOn(cacheManagerMock.store, 'keys').mockResolvedValue([])

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
      const dto = new FunkoDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(funko),
      }
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(funkoRepository, 'remove').mockResolvedValue(funko)
      jest.spyOn(mapper, 'toDto').mockReturnValue(dto)
      jest.spyOn(cacheManagerMock.store, 'keys').mockResolvedValue([])
      jest.spyOn(notification, 'sendMessage').mockImplementation()

      expect(await service.remove(1)).toEqual(dto)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
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
      jest.spyOn(cacheManagerMock.store, 'keys').mockResolvedValue([])
      jest.spyOn(notification, 'sendMessage').mockImplementation()

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

  describe('updateImage', () => {
    it('should update a funko image', async () => {
      const mockFunko = new Funko()
      const mockResponseFunkoDto = new FunkoDto()
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

      jest.spyOn(notificationMock, 'sendMessage').mockResolvedValue('UPDATED')

      jest.spyOn(funkoRepository, 'findOneBy').mockResolvedValue(mockFunko)

      jest.spyOn(storageService, 'removeFile').mockImplementation()

      jest.spyOn(funkoRepository, 'save').mockResolvedValue(mockFunko)

      jest.spyOn(mapper, 'toDto').mockReturnValue(mockResponseFunkoDto)

      jest.spyOn(notification, 'sendMessage').mockImplementation()

      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      expect(await service.updateImage(1, mockFile)).toEqual(
        mockResponseFunkoDto,
      )
    })
  })
  describe('checkCategory', () => {
    it('should return a category', async () => {
      const result = new Category()
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(result),
      }

      jest
        .spyOn(categoryRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      expect(await service.checkCategory('test')).toEqual(result)
    })

    it('should throw 400 bad request', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }

      jest
        .spyOn(categoryRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      await expect(service.checkCategory('test')).rejects.toThrow()
    })
  })
})
