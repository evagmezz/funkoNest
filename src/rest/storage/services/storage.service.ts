import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import * as fs from 'fs'
import { join } from 'path'
import * as process from 'process'
import * as path from 'path'

@Injectable()
export class StorageService {
  private readonly uploadsDir = process.env.UPLOADS_DIR || './storage-dir'
  private readonly isDev = process.env.NODE_ENV === 'dev'
  private readonly logger = new Logger(StorageService.name)

  async reloadDir() {
    if (this.isDev) {
      if (!fs.existsSync(this.uploadsDir)) {
        this.logger.log(`Removing files from directory ${this.uploadsDir}`)
        fs.readdirSync(this.uploadsDir).forEach((file) => {
          fs.unlinkSync(path.join(this.uploadsDir, file))
        })
      } else {
        this.logger.log(`Directory ${this.uploadsDir} created`)
        fs.mkdirSync(this.uploadsDir)
      }
    }
  }
  findFile(filename: string): string {
    this.logger.log(`Searching for file ${filename}`)
    const file = join(
      process.cwd(),
      process.env.UPLOADS_DIR || './storage-dir',
      filename,
    )
    if (fs.existsSync(file)) {
      this.logger.log(`File ${filename} found`)
      return file
    } else {
      throw new NotFoundException(`File ${filename} not found`)
    }
  }

  getFileName(fileUrl: string): string {
    try {
      const url = new URL(fileUrl)
      const path = url.pathname
      const segments = path.split('/')
      const filename = segments[segments.length - 1]
      return filename
    } catch (e) {
      throw new BadRequestException(`Cannot get file name from ${fileUrl}`)
      return fileUrl
    }
  }

  removeFile(filename: string): void {
    this.logger.log(`Removing file ${filename}`)
    const file = join(
      process.cwd(),
      process.env.UPLOADS_DIR || './storage-dir',
      filename,
    )
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
      this.logger.log(`File ${filename} removed`)
    } else {
      throw new NotFoundException(`File ${filename} not found`)
    }
  }
}
