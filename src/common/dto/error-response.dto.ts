import { ApiProperty } from '@nestjs/swagger';
import { BaseException } from '../exceptions/base.exception';

export class ErrorResponseDto extends BaseException {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    description: 'Error message or list of validation errors',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({ nullable: true, example: null })
  errorCode?: string | null;
}
