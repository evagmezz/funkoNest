import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OrdersService } from '../../orders/services/orders.service'
import { UserMapper } from '../mapper/user-mapper'
import { BcryptService } from '../bcrypt.service'
import { Role, UserRole } from '../entities/user-role.entity'
import { User } from '../entities/user.entity'
import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import { CreateOrderDto } from '../../orders/dto/create-order.dto'
import { UpdateOrderDto } from '../../orders/dto/update-order.dto'

/**
 * Servicio encargado de gestionar operaciones relacionadas con los usuarios.
 *
 * Este servicio proporciona métodos para realizar operaciones CRUD en usuarios,
 * manejar roles de usuario y gestionar pedidos asociados a un usuario.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly ordersService: OrdersService,
    private readonly userMapper: UserMapper,
    private readonly bcryptService: BcryptService,
  ) {}

  /**
   * Obtiene todos los usuarios existentes.
   *
   * @returns {Promise<UserDto[]>} - Lista de objetos de transferencia de datos (DTO) correspondientes a usuarios.
   */
  async findAll() {
    this.logger.log('Searching all users...')
    return (await this.userRepository.find()).map((users) =>
      this.userMapper.toResponseDto(users),
    )
  }

  /**
   * Obtiene un usuario por su identificador.
   *
   * @param {number} id - Identificador del usuario.
   * @returns {Promise<UserDto>} - Objeto de transferencia de datos (DTO) correspondiente al usuario.
   */

  async findOne(id: number) {
    this.logger.log(`Searching user with id ${id}`)
    const user = await this.userRepository.findOneBy({ id })
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`)
    } else {
      return this.userMapper.toResponseDto(user)
    }
  }

  /**
   * Crea un nuevo usuario.
   *
   * @param {CreateUserDto} createUserDto - Objeto de transferencia de datos (DTO) para la creación de usuario.
   * @returns {Promise<UserDto>} - Objeto de transferencia de datos (DTO) correspondiente al usuario creado.
   * @throws {BadRequestException} - Si el nombre de usuario o el correo electrónico ya existen.
   */
  async create(createUserDto: CreateUserDto) {
    this.logger.log('Creating user...')
    const existingUser = await Promise.all([
      this.findByUsername(createUserDto.username),
      this.findByEmail(createUserDto.email),
    ])
    if (existingUser[0]) {
      throw new BadRequestException('username already exists')
    }

    if (existingUser[1]) {
      throw new BadRequestException('email already exists')
    }
    const hashPassword = await this.bcryptService.hash(createUserDto.password)

    const user = this.userMapper.toEntity(createUserDto)
    user.password = hashPassword
    const userToSave = await this.userRepository.save(user)
    const roles = createUserDto.roles || [Role.USER]
    const userRoles = roles.map((role) => ({
      user: userToSave,
      role: Role[role],
    }))
    const savedUserRoles = await this.userRoleRepository.save(userRoles)

    return this.userMapper.toResponseDtoWithRoles(userToSave, savedUserRoles)
  }

  /**
   * Valida la existencia de roles de usuario.
   *
   * @param {string[]} roles - Lista de roles a validar.
   * @returns {boolean} - Verdadero si todos los roles son válidos, falso de lo contrario.
   */
  validateRoles(roles: string[]): boolean {
    return roles.every((role) => Role[role])
  }

  /**
   * Obtiene un usuario por su nombre de usuario.
   *
   * @param {string} username - Nombre de usuario del usuario.
   * @returns {Promise<User>} - Instancia del usuario correspondiente al nombre de usuario proporcionado.
   */
  async findByUsername(username: string) {
    this.logger.log(`Searching user with username ${username}`)
    return await this.userRepository.findOneBy({ username })
  }

  /**
   * Valida una contraseña proporcionada comparándola con una contraseña cifrada.
   *
   * @param {string} password - Contraseña proporcionada.
   * @param {string} hashPassword - Contraseña cifrada.
   * @returns {Promise<boolean>} - Verdadero si la contraseña es válida, falso de lo contrario.
   */
  async validatePassword(password: string, hashPassword: string) {
    this.logger.log(`Validating password...`)
    return await this.bcryptService.isMatch(password, hashPassword)
  }

  /**
   * Elimina un usuario por su identificador.
   *
   * @param {number} idUser - Identificador del usuario a eliminar.
   * @returns {Promise<User>} - Objeto de transferencia de datos (DTO) correspondiente al usuario eliminado.
   * @throws {NotFoundException} - Si el usuario no se encuentra.
   */
  async deleteById(idUser: number) {
    this.logger.log(`Deleting user with id ${idUser}`)
    const user = await this.userRepository.findOneBy({ id: idUser })
    if (!user) {
      throw new NotFoundException(`User with id ${idUser} not found`)
    }
    const existOrders = await this.ordersService.userExists(user.id)
    if (existOrders) {
      user.updatedAt = new Date()
      user.isDeleted = true
      return await this.userRepository.save(user)
    } else {
      for (const userRole of user.roles) {
        await this.userRoleRepository.remove(userRole)
      }
      return await this.userRepository.delete({ id: user.id })
    }
  }

  /**
   * Actualiza un perfil de usuario por su identificador.
   *
   * @param {number} id - Identificador del usuario a actualizar.
   * @param {UpdateUserDto} updateUserDto - Objeto de transferencia de datos (DTO) para la actualización del usuario.
   * @param {boolean} updateRoles - Indica si se deben actualizar los roles del usuario.
   * @returns {Promise<UserDto>} - Objeto de transferencia de datos (DTO) correspondiente al usuario actualizado.
   * @throws {NotFoundException} - Si el usuario no se encuentra.
   * @throws {BadRequestException} - Si el nombre de usuario o el correo electrónico ya existen.
   */
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    updateRoles: boolean = false,
  ) {
    this.logger.log(
      `Updating user porfile by id ${id} with ${JSON.stringify(updateUserDto)}`,
    )
    const user = await this.userRepository.findOneBy({ id })
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`)
    }
    if (updateUserDto.username) {
      const existingUser = await this.findByUsername(updateUserDto.username)
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('username already exists')
      }
    }
    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email)
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('email already exists')
      }
    }
    if (updateUserDto.password) {
      updateUserDto.password = await this.bcryptService.hash(
        updateUserDto.password,
      )
    }
    const rolesBackup = [...user.roles]
    Object.assign(user, updateUserDto)

    if (updateRoles) {
      for (const userRole of rolesBackup) {
        await this.userRoleRepository.remove(userRole)
      }
      const roles = updateUserDto.roles || [Role.USER]
      const userRoles = roles.map((role) => ({
        usuario: user,
        role: Role[role],
      }))
      user.roles = await this.userRoleRepository.save(userRoles)
    } else {
      user.roles = rolesBackup
    }
    const updatedUser = await this.userRepository.save(user)
    return this.userMapper.toResponseDto(updatedUser)
  }

  /**
   * Obtiene todos los pedidos asociados a un usuario.
   *
   * @param {number} id - Identificador del usuario.
   * @returns {Promise<any>} - Lista de pedidos asociados al usuario.
   */
  async getOrders(id: number) {
    return await this.ordersService.findByUserId(id)
  }

  /**
   * Obtiene un pedido específico asociado a un usuario.
   *
   * @param {number} idUser - Identificador del usuario.
   * @param {string} orderId - Identificador del pedido.
   * @returns {Promise<any>} - Objeto de transferencia de datos (DTO) correspondiente al pedido.
   * @throws {ForbiddenException} - Si el usuario no tiene permisos para acceder a este recurso.
   */
  async getOrder(idUser: number, orderId: string) {
    const order = await this.ordersService.findOne(orderId)
    if (order.userId != idUser) {
      throw new ForbiddenException(
        'Do not have permission to access this resource',
      )
    }
    return order
  }

  /**
   * Crea un nuevo pedido asociado a un usuario.
   *
   * @param {CreateOrderDto} createOrderDto - Objeto de transferencia de datos (DTO) para la creación de pedido.
   * @param {number} userId - Identificador del usuario.
   * @returns {Promise<any>} - Objeto de transferencia de datos (DTO) correspondiente al pedido creado.
   * @throws {BadRequestException} - Si el identificador del usuario no coincide con el usuario autenticado.
   */
  async createOrder(createOrderDto: CreateOrderDto, userId: number) {
    this.logger.log(`Creating order ${JSON.stringify(createOrderDto)}`)
    if (createOrderDto.userId != userId) {
      throw new BadRequestException(
        'User id must be the same as the authenticated user',
      )
    }
    return await this.ordersService.create(createOrderDto)
  }

  /**
   * Actualiza un pedido asociado a un usuario.
   *
   * @param {string} id - Identificador del pedido.
   * @param {UpdateOrderDto} updateOrderDto - Objeto de transferencia de datos (DTO) para la actualización del pedido.
   * @param {number} userId - Identificador del usuario.
   * @returns {Promise<any>} - Objeto de transferencia de datos (DTO) correspondiente al pedido actualizado.
   * @throws {BadRequestException} - Si el identificador del usuario no coincide con el usuario autenticado.
   * @throws {ForbiddenException} - Si el usuario no tiene permisos para acceder a este recurso.
   */
  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId: number,
  ) {
    this.logger.log(
      `Updating order ${id} with ${JSON.stringify(updateOrderDto)}`,
    )
    if (updateOrderDto.userId != userId) {
      throw new BadRequestException(
        'User id must be the same as the authenticated user',
      )
    }
    const order = await this.ordersService.findOne(id)
    if (order.userId != userId) {
      throw new ForbiddenException(
        'Do not have permission to access this resource',
      )
    }
    return await this.ordersService.update(id, updateOrderDto)
  }

  /**
   * Elimina un pedido asociado a un usuario.
   *
   * @param {string} orderId - Identificador del pedido.
   * @param {number} userId - Identificador del usuario.
   * @returns {Promise<any>} - Objeto de transferencia de datos (DTO) correspondiente al pedido eliminado.
   * @throws {ForbiddenException} - Si el usuario no tiene permisos para acceder a este recurso.
   */
  async removeOrder(orderId: string, userId: number) {
    this.logger.log(`Removing order with id: ${orderId}`)
    const order = await this.ordersService.findOne(orderId)
    if (order.userId != userId) {
      throw new ForbiddenException(
        'Do not have permission to access this resource',
      )
    }
    return await this.ordersService.remove(orderId)
  }

  /**
   * Busca un usuario por su dirección de correo electrónico.
   *
   * @param {string} email - Dirección de correo electrónico del usuario.
   * @returns {Promise<User>} - Instancia del usuario correspondiente a la dirección de correo electrónico proporcionada.
   */
  private async findByEmail(email: string) {
    this.logger.log(`Searching for email: ${email}`)
    return await this.userRepository.findOneBy({ email })
  }
}
