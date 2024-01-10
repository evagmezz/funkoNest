import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { FunkoDto } from '../../rest/funkos/dto/funko.dto'
import { CategoryDto } from '../../rest/category/dto/category.dto'

@WebSocketGateway({})
export class NotificationsGateway {
  @WebSocketServer()
  private server: Server

  private readonly logger = new Logger(NotificationsGateway.name)

  sendMessage(type: string, notification: FunkoDto | CategoryDto) {
    if (this.isFunko(notification)) {
      this.server.emit(`FUNKO_${type}`, notification)
    } else {
      this.server.emit(`CATEGORY_${type}`, notification)
    }
  }

  private isFunko(
    notification: FunkoDto | CategoryDto,
  ): notification is FunkoDto {
    return (notification as FunkoDto).image !== undefined
  }

  private handleConnection(client: Socket) {
    this.logger.debug('Client connected:', client.id)
    this.server.emit('connection', 'Welcome:)')
  }

  private handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id)
    this.logger.debug('Client disconnected:', client.id)
  }
}
