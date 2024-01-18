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

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

  private notify(type: 'CREATE' | 'UPDATE' | 'DELETE', data: FunkoDto) {
    this.notificationsGateway.sendMessage(type, data)
  }
}
