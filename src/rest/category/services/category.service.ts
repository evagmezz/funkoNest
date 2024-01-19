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

/**
 * Servicio que gestiona las operaciones relacionadas con las categorías.
 */
@Injectable()
export class CategoryService {
  private logger = new Logger('CategoryService')

  /**
   * Constructor del servicio de categorías.
   *
   * @param {CategoryMapper} categoryMapper - Mapper utilizado para mapear datos relacionados con las categorías.
   * @param {NotificationsGateway} notificationsGateway - Gateway para notificaciones en tiempo real.
   * @param {Repository<Category>} categoryRepository - Repositorio de categorías.
   * @param {Cache} cacheManager - Manager de caché utilizado para almacenar y recuperar datos en caché.
   */
  constructor(
    private readonly categoryMapper: CategoryMapper,
    private readonly notificationsGateway: NotificationsGateway,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Obtiene todas las categorías paginadas.
   *
   * @param {PaginateQuery} query - Parámetros de paginación y búsqueda.
   * @returns {Promise<CategoryDto[]>} - Promesa que representa la lista de categorías paginadas.
   */
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
        name: [FilterOperator.EQ, FilterSuffix.NOT, FilterOperator.ILIKE],
      },
    })
    await this.cacheManager.set(
      `all_categories_page_${hash(JSON.stringify(query))}`,
      page,
      60,
    )
    return page
  }

  /**
   * Obtiene una categoría por su ID.
   *
   * @param {string} id - ID de la categoría a buscar.
   * @returns {Promise<CategoryDto>} - Promesa que representa la categoría encontrada.
   * @throws {NotFoundException} - Si la categoría no existe.
   */
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

  /**
   * Crea una nueva categoría a partir de los datos proporcionados y la almacena en la base de datos.
   *
   * @param {CreateCategoryDto} createCategoryDto - Datos de la categoría a ser creada.
   * @returns {Promise<CategoryDto>} - Promesa que representa la categoría creada.
   */
  async create(createCategoryDto: CreateCategoryDto) {
    this.logger.log('Creando categoria...')
    const category = this.categoryMapper.toEntity(createCategoryDto)
    const categoryCreated = await this.categoryExists(category.name)
    const dto = this.categoryMapper.toDto(categoryCreated)
    this.notify('CREATE', dto)
    await this.invalidateCacheKey('all_categories')
    return dto
  }

  /**
   * Actualiza una categoría existente identificada por su ID con los datos proporcionados.
   *
   * @param {string} id - ID de la categoría a ser actualizada.
   * @param {UpdateCategoryDto} updateCategoryDto - Datos actualizados de la categoría.
   * @returns {Promise<CategoryDto>} - Promesa que representa la categoría actualizada.
   * @throws {BadRequestException} - Si la categoría con el nuevo nombre ya existe.
   */
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

  /**
   * Elimina una categoría existente identificada por su ID de la base de datos.
   *
   * @param {string} id - ID de la categoría a ser eliminada.
   * @returns {Promise<void>} - Promesa que indica la eliminación exitosa de la categoría.
   * @throws {NotFoundException} - Si la categoría con el ID proporcionado no existe.
   */
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

  /**
   * Cambia el estado activo de una categoría identificada por su ID a inactivo.
   *
   * @param {string} id - ID de la categoría a ser desactivada.
   * @returns {Promise<Category>} - Promesa que representa la categoría actualizada.
   * @throws {NotFoundException} - Si la categoría con el ID proporcionado no existe.
   */
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

  /**
   * Verifica la existencia de una categoría por su nombre y la devuelve. Si no existe, la crea.
   *
   * @param {string} name - Nombre de la categoría.
   * @returns {Promise<Category>} - Promesa que representa la categoría existente o recién creada.
   * @throws {BadRequestException} - Si la categoría con el nombre proporcionado ya existe y está activa.
   */
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

  /**
   * Invalida las claves de caché que coinciden con el patrón proporcionado.
   *
   * @param {string} keyPattern - Patrón de claves de caché a ser invalidadas.
   * @returns {Promise<void>} - Promesa que indica que las claves de caché han sido invalidadas.
   */
  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

  /**
   * Notifica a través del gateway de notificaciones la acción realizada en una categoría.
   *
   * @param {'CREATE' | 'UPDATE' | 'DELETE'} type - Tipo de acción realizada.
   * @param {CategoryDto} data - Datos de la categoría afectada.
   * @returns {void}
   * @private
   */
  private notify(type: 'CREATE' | 'UPDATE' | 'DELETE', data: CategoryDto) {
    this.notificationsGateway.sendMessage(type, data)
  }
}
