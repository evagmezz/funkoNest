import { Test, TestingModule } from '@nestjs/testing'
import { StorageController } from './storage.controller'
import { StorageService } from '../services/storage.service'

describe('StorageController', () => {
  let controller: StorageController
  let service: StorageService

  beforeEach(async () => {
    const mockService = {
      findFile: jest
        .fn()
        .mockImplementation((filename) => `path/to/${filename}`),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [{ provide: StorageService, useValue: mockService }],
    }).compile()

    controller = module.get<StorageController>(StorageController)
    service = module.get<StorageService>(StorageService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('storeFile', () => {
    it('should return file', () => {
      const file = {
        originalname: 'test.jpg',
        filename: 'test.jpg',
        size: 100,
        mimetype: 'image/jpeg',
        path: 'path/to/test.jpg',
        url: 'http://undefined/api/storage/test.jpg',
      }

      jest.spyOn(service, 'findFile').mockReturnValue(file.path)

      expect(
        controller.storeFile(
          file as any,
          { protocol: 'http', get: jest.fn() } as any,
        ),
      ).toEqual(file)
    })
    it('should throw BadRequestException if no file is provided', () => {
      expect(() => controller.storeFile(undefined, {} as any)).toThrow(
        TypeError,
      )
    })
  })

  describe('getFile', () => {
    it('should return file path', () => {
      controller.getFile('test.jpg', {
        sendFile: jest.fn(),
      } as any)
      expect(service.findFile).toHaveBeenCalledWith('test.jpg')
    })
  })
})
