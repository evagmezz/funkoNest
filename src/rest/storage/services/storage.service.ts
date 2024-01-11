import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as process from 'process'
import * as fs from 'fs'
import * as path from 'path'
import { join } from 'path'

@Injectable()
export class StorageService {
  private readonly uploadsFolder = process.env.UPLOADS_FOLDER || './storage-dir'
  private readonly isDev = process.env.NODE_ENV === 'dev'
  private readonly logger = new Logger(StorageService.name)

  async onModuleInit() {
    if (this.isDev) {
      if (fs.existsSync(this.uploadsFolder)) {
        this.logger.log(`Removing files from ${this.uploadsFolder}`)
        fs.readdirSync(this.uploadsFolder).forEach((file) => {
          fs.unlinkSync(path.join(this.uploadsFolder, file))
        })
      } else {
        this.logger.log(
          `Creating folder ${this.uploadsFolder} for file uploads`,
        )
        fs.mkdirSync(this.uploadsFolder)
      }
    }
  }

  findFile(filename: string) {
    this.logger.log(`Searching for file ${filename}`)
    const file = join(
      process.cwd(),
      process.env.UPLOADS_FOLDER || './storage-dir',
      filename,
    )
    if (fs.existsSync(file)) {
      this.logger.log(`File ${filename} found`)
      return file
    } else {
      throw new NotFoundException(`File ${filename} not found`)
    }
  }

  removeFile(filename: string): void {
    this.logger.log(`Removing file ${filename}`)
    const file = join(
      process.cwd(),
      process.env.UPLOADS_FOLDER || './storage-dir',
      filename,
    )
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    } else {
      throw new NotFoundException(`File ${filename} not found`)
    }
  }
}
