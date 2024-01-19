import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as process from 'process'
import * as fs from 'fs'
import * as path from 'path'
import { join } from 'path'

/**
 * Servicio encargado de la gestión de almacenamiento, como subida, búsqueda y eliminación de archivos.
 *
 * Este servicio se utiliza para manejar la lógica de almacenamiento de archivos, incluyendo la creación
 * y limpieza de carpetas de carga en el entorno de desarrollo.
 */
@Injectable()
export class StorageService {
  private readonly uploadsFolder = process.env.UPLOADS_FOLDER || './storage-dir'
  private readonly isDev = process.env.NODE_ENV === 'dev'
  private readonly logger = new Logger(StorageService.name)

  /**
   * Método llamado cuando el módulo se inicializa. En el entorno de desarrollo, se encarga de limpiar
   * los archivos de la carpeta de carga o de crear la carpeta si no existe.
   */
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

  /**
   * Busca un archivo en la carpeta de carga.
   *
   * @param {string} filename - El nombre del archivo a buscar.
   * @returns {string} - La ruta completa del archivo encontrado.
   * @throws {NotFoundException} - Excepción lanzada si el archivo no se encuentra.
   */
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

  /**
   * Elimina un archivo de la carpeta de carga.
   *
   * @param {string} filename - El nombre del archivo a eliminar.
   * @throws {NotFoundException} - Excepción lanzada si el archivo no se encuentra.
   */
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
