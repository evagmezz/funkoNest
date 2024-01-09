import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { UpdateFunkoDto } from '../dto/update-funko.dto'
import { Funko } from '../entities/funko.entity'
import { FunkoMapper } from '../mapper/funko-mapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from '../../category/entities/category.entity'
import { StorageService } from '../../storage/services/storage.service'
import { Request } from 'express'

@Injectable()
export class FunkosService {
  private logger = new Logger('FunkosService')

  constructor(
    private readonly storageService: StorageService,
    private readonly funkoMapper: FunkoMapper,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll() {
    this.logger.log('Buscando todos los funkos...')
    const funkos = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.category', 'category')
      .where('funko.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('funko.id', 'ASC')
      .getMany()
    return funkos.map((funko) => this.funkoMapper.toDto(funko))
  }

  async findOne(id: number) {
    this.logger.log(`Buscando funko con id: ${id}`)
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.category', 'category')
      .where('funko.id = :id', { id })
      .getOne()
    if (!funko) {
      throw new NotFoundException(`Funko con id: ${id} no encontrado`)
    } else {
      return this.funkoMapper.toDto(funko)
    }
  }

  async create(createFunkoDto: CreateFunkoDto) {
    this.logger.log('Funko creado')
    const category: Category = await this.checkCategory(createFunkoDto.category)
    const funko = this.funkoMapper.toEntity(createFunkoDto, category)
    const funkoCreated = await this.funkoRepository.save(funko)
    return this.funkoMapper.toDto(funkoCreated)
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Actualizando funko con id: ${id}`)
    const category: Category = await this.checkCategory(updateFunkoDto.category)
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.category', 'category')
      .where('funko.id = :id and funko.isDeleted = :isDeleted', {
        id,
        isDeleted: false,
      })
      .getOne()
    if (!funko || !category) {
      throw new NotFoundException(
        `Funko con id: ${id} o categoria no encontrados`,
      )
    }
    const funkoUpdated = await this.funkoRepository.save({
      ...funko,
      ...updateFunkoDto,
      category,
    })
    return this.funkoMapper.toDto(funkoUpdated)
  }

  async remove(id: number) {
    this.logger.log(`Eliminando funko con id: ${id}`)
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.category', 'category')
      .where('funko.id = :id', { id })
      .getOne()
    if (!funko) {
      throw new NotFoundException(`Funko con id: ${id} no encontrado`)
    } else {
      if (funko.image !== Funko.IMAGE_DEFAULT) {
        try {
          this.storageService.removeFile(funko.image)
        } catch (error) {
          this.logger.error(error)
        }
      }
    }
    const removed = await this.funkoRepository.remove(funko)
    return this.funkoMapper.toDto(removed)
  }

  async isDeletedToTrue(id: number) {
    this.logger.log(`Eliminado logico de funko con id: ${id}`)
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.category', 'category')
      .where('funko.id = :id', { id })
      .getOne()
    if (!funko) {
      throw new NotFoundException(`Funko con id: ${id} no encontrado`)
    }
    const funkoDeleted = await this.funkoRepository.save({
      ...funko,
      isDeleted: true,
    })
    return this.funkoMapper.toDto(funkoDeleted)
  }

  async checkCategory(nameCategory: string) {
    this.logger.log(`Buscando categoria con nombre: ${nameCategory}`)
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.name = :name and' + ' category.isActive = :isActive', {
        name: nameCategory,
        isActive: true,
      })
      .getOne()
    if (!category) {
      throw new NotFoundException(
        `Categoria con nombre: ${nameCategory} no encontrada`,
      )
    }
    return category
  }

  async updateImg(
    id: number,
    file: Express.Multer.File,
    req: Request,
    withUrl: boolean = true,
  ) {
    this.logger.log(`Updating image for funko with id: ${id}`)
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.category', 'category')
      .where('funko.id = :id and funko.isDeleted = :isDeleted', {
        id,
        isDeleted: false,
      })
      .getOne()
    if (!funko) {
      throw new NotFoundException(`Funko with id: ${id} not found`)
    }
    if (funko.image !== Funko.IMAGE_DEFAULT) {
      this.logger.log(`Removing image for funko with id: ${id}`)
      let imagePath = funko.image
      if (withUrl) {
        imagePath = this.storageService.getFileName(funko.image)
      }
      try {
        this.storageService.removeFile(imagePath)
      } catch (error) {
        this.logger.error(error)
      }
    }
    if (!file) {
      throw new BadRequestException('File is required')
    }
    let filePath: string
    if (withUrl) {
      filePath = `${req.protocol}://${req.get('host')}$/storage/${
        file.filename
      }`
    } else {
      filePath = file.filename
    }
    funko.image = filePath

    const funkoUpdated = await this.funkoRepository.save(funko)
    return this.funkoMapper.toDto(funkoUpdated)
  }
}
