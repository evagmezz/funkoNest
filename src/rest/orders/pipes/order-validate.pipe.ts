import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { PedidosOrderValues } from '../services/orders.service'

@Injectable()
export class OrderValidatePipe implements PipeTransform {
  transform(value: any) {
    value = value || PedidosOrderValues[0]
    if (!PedidosOrderValues.includes(value)) {
      throw new BadRequestException(
        `It does not specify a valid order. Valid orders are: ${PedidosOrderValues.join(
          ', ',
        )}`,
      )
    }
    return value
  }
}
