import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Param,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'

import { diskStorage } from 'multer'
import { FileInterceptor } from '@nestjs/platform-express'
import { Request, Response } from 'express'
import * as process from 'process'
import { v4 as uuidv4 } from 'uuid'
import { extname } from 'path'
import { StorageService } from '../services/storage.service'

@Controller('api/storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name)

  constructor(private readonly storageService: StorageService) {}

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_FOLDER || './storage-dir',
        filename: (req, file, cb) => {
          const fileName = uuidv4()
          const fileExt = extname(file.originalname)
          cb(null, `${fileName}${fileExt}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new BadRequestException('File not supported'), false)
        } else {
          cb(null, true)
        }
      },
    }),
  )
  storeFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    this.logger.log(`Storing file ${file.originalname}`)

    if (!file) {
      throw new BadRequestException('File not found')
    }

    const url = `${req.protocol}://${req.get('host')}/api/storage/${
      file.filename
    }`
    console.log(file)
    return {
      originalname: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      url: url,
    }
  }

  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    this.logger.log(`Searching for file ${filename}`)
    const filePath = this.storageService.findFile(filename)
    this.logger.log(`File ${filename} found`)
    res.sendFile(filePath)
  }
}
