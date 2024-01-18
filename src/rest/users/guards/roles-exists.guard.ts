import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { UsersService } from '../services/users.service'

@Injectable()
export class RolesExistsGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const roles = request.body.roles

    if (!roles || roles.length === 0) {
      throw new BadRequestException('User must have at least one role')
    }

    if (!this.usersService.validateRoles(roles)) {
      throw new BadRequestException('User has invalid roles')
    }

    return true
  }
}
