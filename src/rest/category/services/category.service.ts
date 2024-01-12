import {
  BadRequestException,
  Inject,
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
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { hash } from 'typeorm/util/StringUtils'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'

@Injectable()
export class CategoryService {
  private logger = new Logger('CategoryService')

  constructor(
    private readonly categoryMapper: CategoryMapper,
    private readonly notificationsGateway: NotificationsGateway,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(query: PaginateQuery) {
    this.logger.log('Buscando todas las categorias...')
    const cache: CategoryDto[] = await this.cacheManager.get(
      `all_categories_page_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }
    const page = await paginate(query, this.categoryRepository, {
      sortableColumns: ['name'],
      defaultSortBy: [['name', 'ASC']],
      searchableColumns: ['name'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
        isActive: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    })
    await this.cacheManager.set(
      `all_categories_page_${hash(JSON.stringify(query))}`,
      page,
      60,
    )
    return page
  }
  async findOne(id: string) {
    this.logger.log(`Find one categoria by id:${id}`)
    const cache: CategoryDto = await this.cacheManager.get(`category-${id}`)
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }
    const category = await this.categoryRepository.findOneBy({ id })
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`)
    }
    await this.cacheManager.set(`category-${id}`, category, 60)
    return category
  }

  async create(createCategoryDto: CreateCategoryDto) {
    this.logger.log('Creando categoria...')
    const category = this.categoryMapper.toEntity(createCategoryDto)
    const categoryCreated = await this.categoryExists(category.name)
    const dto = this.categoryMapper.toDto(categoryCreated)
    this.notify('CREATE', dto)
    await this.invalidateCacheKey('all_categories')
    return dto
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
      const saved = await this.categoryRepository.save({
        ...categoryToUpdate,
        ...updateCategoryDto,
      })
      const dto = this.categoryMapper.toDto(saved)
      this.notify('UPDATE', dto)
      await this.invalidateCacheKey(`category_${id}`)
      await this.invalidateCacheKey('all_categories')
      return dto
    }
  }

  async remove(id: string) {
    const category = await this.categoryExists(id)
    if (!category) {
      throw new NotFoundException(`Categoria con id ${id} no encontrada`)
    } else {
      this.notify('DELETE', this.categoryMapper.toDto(category))
      await this.invalidateCacheKey(`category_${id}`)
      await this.invalidateCacheKey('all_categories')
      return await this.categoryRepository.remove(category)
    }
  }

  async changeIsActive(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id })
    if (!category) {
      throw new NotFoundException(`Categoria con id ${id} no encontrada`)
    } else {
      this.notify('UPDATE', this.categoryMapper.toDto(category))
      await this.invalidateCacheKey(`category_${id}`)
      await this.invalidateCacheKey('all_categories')
      return await this.categoryRepository.save({
        ...category,
        isActive: false,
      })
    }
  }

  async categoryExists(name: string) {
    const cache: Category = await this.cacheManager.get(`category_name_${name}`)
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }
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
        await this.cacheManager.set(`category_name_${name}`, category, 60)
        return await this.categoryRepository.save(category)
      }
    }
  }

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

  private notify(type: 'CREATE' | 'UPDATE' | 'DELETE', data: CategoryDto) {
    this.notificationsGateway.sendMessage(type, data)
  }
}
