import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { UpdateFunkoDto } from '../dto/update-funko.dto'
import { Funko } from '../entities/funko.entity'
import { FunkoMapper } from '../mapper/funko-mapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from '../../category/entities/category.entity'
import { FunkoDto } from '../dto/funko.dto'

@Injectable()
export class FunkosService {
  private logger = new Logger('FunkosService')

  constructor(
    private readonly funkoMapper: FunkoMapper,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {
  }

  async findAll(): Promise<FunkoDto[]> {
    this.logger.log('Buscando todos los funkos...')
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.category', 'category')
      .where('funko.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('funko.id', 'ASC')
      .getMany()
    return funko.map((funko) => this.funkoMapper.toDto(funko))
  }

  async findOne(id: number): Promise<FunkoDto> {
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

  async create(createFunkoDto: CreateFunkoDto): Promise<FunkoDto> {
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
    }
    await this.funkoRepository.delete(funko)
  }

  async isDeletedToTrue(id: number) {
    this.logger.log(`Eliminando funko con id: ${id}`)
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.category', 'category')
      .where('funko.id = :id', { id })
      .getOne()
    if (!funko) {
      throw new NotFoundException(`Funko con id: ${id} no encontrado`)
    }
    await this.funkoRepository.save({
      ...funko,
      isDeleted: true,
    })
  }

  private async checkCategory(nameCategory: string): Promise<Category> {
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

}
