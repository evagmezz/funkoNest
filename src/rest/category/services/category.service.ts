import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { CategoryMapper } from '../mapper/category-mapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from '../entities/category.entity'
import { CategoryDto } from '../dto/category.dto'
import { NotificationsGateway } from '../../../websockets/notifications/notifications.gateway'

@Injectable()
export class CategoryService {
  private logger = new Logger('CategoryService')

  async findAll() {
    this.logger.log('Buscando todas las categorias...')
    return await this.categoryRepository.find()
  }

  constructor(
    private readonly categoryMapper: CategoryMapper,
    private readonly notificationsGateway: NotificationsGateway,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findOne(id: string) {
    this.logger.log(`Find one categoria by id:${id}`)
    const category = await this.categoryRepository.findOneBy({ id })
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`)
    }
    return category
  }

  async create(createCategoryDto: CreateCategoryDto) {
    this.logger.log('Creando categoria...')
    const category = this.categoryMapper.toEntity(createCategoryDto)
    const categoryCreated = await this.categoryExists(category.name)
    this.notify('CREATE', this.categoryMapper.toDto(categoryCreated))
    return await this.categoryRepository.save(categoryCreated)
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    this.logger.log(`Actualizando categoria con id:${id}`)
    const categoryToUpdate = await this.findOne(id)
    if (updateCategoryDto.name) {
      const category = await this.categoryRepository
        .createQueryBuilder('category')
        .where('LOWER(name) = LOWER(:name)', { name: updateCategoryDto.name })
        .getOne()
      if (category && category.id !== categoryToUpdate.id) {
        throw new BadRequestException(
          `Categoria ${updateCategoryDto.name} ya existe`,
        )
      }
    }
    this.notify('UPDATE', this.categoryMapper.toDto(categoryToUpdate))
    return await this.categoryRepository.save({
      ...categoryToUpdate,
      ...updateCategoryDto,
    })
  }

  async remove(id: string) {
    const category = await this.categoryExists(id)
    if (!category) {
      throw new NotFoundException(`Categoria con id ${id} no encontrada`)
    } else {
      this.notify('DELETE', this.categoryMapper.toDto(category))
      return await this.categoryRepository.remove(category)
    }
  }

  async changeIsActive(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id })
    if (!category) {
      throw new NotFoundException(`Categoria con id ${id} no encontrada`)
    } else {
      this.notify('UPDATE', this.categoryMapper.toDto(category))
      return await this.categoryRepository.save({
        ...category,
        isActive: false,
      })
    }
  }

  async categoryExists(name: string) {
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .where('LOWER(name) = LOWER(:name)', { name })
      .getOne()
    if (!category) {
      const newCategory = new Category()
      newCategory.name = name
      newCategory.isActive = true
      return await this.categoryRepository.save(newCategory)
    } else if (category) {
      if (category.isActive === true) {
        throw new BadRequestException(`Categoria con nombre ${name} ya existe`)
      } else if (category.isActive === false) {
        category.isActive = true
        return await this.categoryRepository.save(category)
      }
    }
  }
  private notify(type: 'CREATE' | 'UPDATE' | 'DELETE', data: CategoryDto) {
    this.notificationsGateway.sendMessage(type, data)
  }
}
