import { Test, TestingModule } from '@nestjs/testing'
import { StorageService } from './storage.service'
import * as fs from 'fs'
import { join } from 'path'

jest.mock('fs')

describe('StorageService', () => {
  let service: StorageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile()

    service = module.get<StorageService>(StorageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findFile', () => {
    it('should return file path if file exists', () => {
      const filename = 'test'
      const filePath = join(process.cwd(), service['uploadsFolder'], filename)
      jest.spyOn(fs, 'existsSync').mockReturnValue(true)

      const result = service.findFile(filename)

      expect(result).toEqual(filePath)
    })

    it('should throw NotFoundException if file does not exist', () => {
      const filename = 'test'
      jest.spyOn(fs, 'existsSync').mockReturnValue(false)

      expect(() => service.findFile(filename)).toThrow()
    })
  })

  describe('removeFile', () => {
    it('should remove file if it exists', () => {
      const filename = 'test'
      const filePath = join(process.cwd(), service['uploadsFolder'], filename)
      jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      const unlinkSyncSpy = jest.spyOn(fs, 'unlinkSync')

      service.removeFile(filename)

      expect(unlinkSyncSpy).toHaveBeenCalledWith(filePath)
    })

    it('should throw NotFoundException if file does not exist', () => {
      const filename = 'test'
      jest.spyOn(fs, 'existsSync').mockReturnValue(false)

      expect(() => service.removeFile(filename)).toThrow()
    })
  })
})
