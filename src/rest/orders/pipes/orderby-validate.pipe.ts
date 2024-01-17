import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { PedidosOrderByValues } from '../services/orders.service'

@Injectable()
export class OrderByValidatePipe implements PipeTransform {
  transform(value: any) {
    value = value || PedidosOrderByValues[0]
    if (!PedidosOrderByValues.includes(value)) {
      throw new BadRequestException(
        `It does not specify a valid order by. Valid orders by are: ${PedidosOrderByValues.join(
          ', ',
        )}`,
      )
    }
    return value
  }
}
