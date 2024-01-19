import {
  BadRequestException,
  Inject,
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
import { NotificationsGateway } from '../../../websockets/notifications/notifications.gateway'
import { FunkoDto } from '../dto/funko.dto'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'

/**
 * Servicio que proporciona métodos para la gestión de Funkos.
 */
@Injectable()
export class FunkosService {
  private logger = new Logger('FunkosService')

  constructor(
    private readonly storageService: StorageService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly funkoMapper: FunkoMapper,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Obtiene todos los Funkos paginados según el objeto de consulta proporcionado.
   *
   * @param {PaginateQuery} query - Objeto de consulta para la paginación.
   * @returns {Promise<{ data: FunkoDto[]; meta: any; links: { first?: string; previous?: string; next?: string; last?: string; } }>} - Promesa que representa la lista de Funkos paginada.
   */
  async findAll(query: PaginateQuery) {
    this.logger.log('Buscando todos los funkos...')
    const cache: FunkoDto[] = await this.cacheManager.get(
      `all_funkos_page_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Funkos encontrados en cache')
      return cache
    }
    const funkos = this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.category', 'category')

    const page = await paginate(query, funkos, {
      sortableColumns: ['name', 'price', 'id'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['name', 'price', 'quantity', 'id'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
        price: [FilterOperator.EQ, FilterOperator.GT, FilterOperator.LT],
      },
    })
    const dto = {
      data: (page.data ?? []).map((funko) => this.funkoMapper.toDto(funko)),
      meta: page.meta,
      links: page.links,
    }

    await this.cacheManager.set(
      `all_funkos_page_${hash(JSON.stringify(query))}`,
      dto,
      60,
    )
    return dto
  }

  /**
   * Obtiene un Funko específico por su ID.
   *
   * @param {number} id - ID del Funko a ser buscado.
   * @returns {Promise<FunkoDto>} - Promesa que representa el Funko encontrado.
   * @throws {NotFoundException} - Si el Funko con el ID proporcionado no existe.
   */
  async findOne(id: number) {
    this.logger.log(`Buscando funko con id: ${id}`)
    const cache: FunkoDto = await this.cacheManager.get(`funko-${id}`)
    if (cache) {
      this.logger.log(`Funko con id: ${id} encontrado en cache`)
      return cache
    }
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.category', 'category')
      .where('funko.id = :id', { id })
      .getOne()
    if (!funko) {
      throw new NotFoundException(`Funko con id: ${id} no encontrado`)
    } else {
      await this.cacheManager.set(`funko-${id}`, funko, 60)
      const funkoDto = this.funkoMapper.toDto(funko)
      return funkoDto
    }
  }

  /**
   * Crea un nuevo Funko a partir de los datos proporcionados.
   *
   * @param {CreateFunkoDto} createFunkoDto - Datos del Funko a ser creado.
   * @returns {Promise<FunkoDto>} - Promesa que representa el Funko creado.
   */
  async create(createFunkoDto: CreateFunkoDto) {
    this.logger.log('Funko creado')
    const category: Category = await this.checkCategory(createFunkoDto.category)
    const funko = this.funkoMapper.toEntity(createFunkoDto, category)
    const funkoCreated = await this.funkoRepository.save(funko)
    const funkoDto = this.funkoMapper.toDto(funkoCreated)
    this.notify('CREATE', funkoDto)
    await this.invalidateCacheKey('all_funkos')
    return funkoDto
  }

  /**
   * Actualiza un Funko existente identificado por su ID con los datos proporcionados.
   *
   * @param {number} id - ID del Funko a ser actualizado.
   * @param {UpdateFunkoDto} updateFunkoDto - Datos actualizados del Funko.
   * @returns {Promise<FunkoDto>} - Promesa que representa el Funko actualizado.
   * @throws {NotFoundException} - Si el Funko o la categoría asociada no son encontrados.
   */
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
    const funkoDto = this.funkoMapper.toDto(funkoUpdated)
    this.notify('UPDATE', funkoDto)
    await this.invalidateCacheKey(`funko-${id}`)
    await this.invalidateCacheKey('all_funkos')
    return funkoDto
  }

  /**
   * Elimina un Funko existente identificado por su ID de la base de datos.
   *
   * @param {number} id - ID del Funko a ser eliminado.
   * @returns {Promise<FunkoDto>} - Promesa que representa el Funko eliminado.
   * @throws {NotFoundException} - Si el Funko con el ID proporcionado no existe.
   */
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

    if (funko.image !== Funko.IMAGE_DEFAULT) {
      try {
        this.storageService.removeFile(funko.image)
      } catch (error) {
        this.logger.error(error)
      }
    }

    const removed = await this.funkoRepository.remove(funko)
    const funkoDto = this.funkoMapper.toDto(removed)
    this.notify('DELETE', funkoDto)
    await this.invalidateCacheKey(`funko-${id}`)
    await this.invalidateCacheKey('all_funkos')
    return funkoDto
  }

  /**
   * Realiza una eliminación lógica de un Funko cambiando la propiedad `isDeleted` a `true`.
   *
   * @param {number} id - ID del Funko a ser eliminado lógicamente.
   * @returns {Promise<FunkoDto>} - Promesa que representa el Funko eliminado lógicamente.
   * @throws {NotFoundException} - Si el Funko con el ID proporcionado no existe.
   */
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
    const funkoDto = this.funkoMapper.toDto(funkoDeleted)
    this.notify('DELETE', funkoDto)
    await this.invalidateCacheKey(`funko-${id}`)
    await this.invalidateCacheKey('all_funkos')
    return funkoDto
  }

  /**
   * Verifica la existencia de una categoría por su nombre. Si no existe, lanza una excepción.
   *
   * @param {string} name - Nombre de la categoría a ser verificada.
   * @returns {Promise<Category>} - Promesa que representa la categoría encontrada.
   * @throws {BadRequestException} - Si la categoría con el nombre proporcionado no existe o no está activa.
   */
  async checkCategory(name: string) {
    this.logger.log(`Finding category with name ${name}`)
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .where('LOWER(category.name) = LOWER(:name)', {
        name: name,
      })
      .andWhere('category.isActive = true')
      .getOne()
    if (category) {
      return category
    } else {
      throw new BadRequestException(`Category ${name} not found`)
    }
  }

  /**
   * Actualiza la imagen de un Funko identificado por su ID.
   *
   * @param {number} id - ID del Funko cuya imagen se actualizará.
   * @param {Express.Multer.File} file - Archivo de imagen a ser actualizado.
   * @returns {Promise<FunkoDto>} - Promesa que representa el Funko con la imagen actualizada.
   * @throws {NotFoundException} - Si el Funko con el ID proporcionado no existe.
   * @throws {BadRequestException} - Si el archivo no es proporcionado.
   */
  async updateImage(id: number, file: Express.Multer.File) {
    this.logger.log(`Updating funko image with id ${id}`)
    const funkoToUpdate = await this.funkoRepository.findOneBy({ id })
    if (!funkoToUpdate) {
      throw new NotFoundException(`Funko #${id} not found`)
    }
    if (!file) {
      throw new BadRequestException('File is required')
    }
    if (funkoToUpdate.image !== Funko.IMAGE_DEFAULT) {
      this.logger.log(`Eliminando imagen antigua ${funkoToUpdate.image}`)
      try {
        this.storageService.removeFile(funkoToUpdate.image)
      } catch (error) {
        this.logger.error(error)
      }
    }

    funkoToUpdate.image = file.filename
    const funkoUpdated = await this.funkoRepository.save(funkoToUpdate)
    const dto = this.funkoMapper.toDto(funkoUpdated)
    this.notify('UPDATE', dto)
    await this.invalidateCacheKey(`funko-${id}`)
    await this.invalidateCacheKey('all-funkos')
    return dto
  }

  /**
   * Invalida las claves de caché que coinciden con el patrón proporcionado.
   *
   * @param {string} keyPattern - Patrón de clave de caché a ser invalidado.
   * @returns {Promise<void>} - Promesa que representa la finalización de la invalidación de caché.
   */
  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

  /**
   * Notifica a través del gateway de notificaciones la acción realizada en un Funko.
   *
   * @param {'CREATE' | 'UPDATE' | 'DELETE'} type - Tipo de acción realizada.
   * @param {FunkoDto} data - Datos del Funko afectado.
   * @returns {void}
   * @private
   */
  private notify(type: 'CREATE' | 'UPDATE' | 'DELETE', data: FunkoDto) {
    this.notificationsGateway.sendMessage(type, data)
  }
}
