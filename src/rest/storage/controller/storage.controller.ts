import { StorageService } from '../services/storage.service'
import { Controller, Get, Param, Res } from '@nestjs/common'
import { Response } from 'express'

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = this.storageService.findFile(filename)
    res.sendFile(file)
  }
}
