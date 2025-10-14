import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class ConflictException extends BaseException {
  constructor(message = 'Conflict data ') {
    super(message, HttpStatus.CONFLICT);
  }
}
