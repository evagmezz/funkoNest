import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { ObjectId } from 'mongodb'

@Injectable()
export class IdValidatePipe implements PipeTransform {
  transform(value: any) {
    if (!ObjectId.isValid(value)) {
      throw new BadRequestException(
        'Id must be a single String of 12 bytes or a string of 24 hex characters',
      )
    }
    return value
  }
}
