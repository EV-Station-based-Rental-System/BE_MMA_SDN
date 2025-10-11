import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationDto } from '../basePagination.dto';

import { Transform } from 'class-transformer';
import { toBoolean } from 'src/common/utils/helper';

export class UserPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({
    description: 'Search term to filter results',
    example: 'email |full_name | phone_number',
  })
  @IsOptional()
  @IsString()
  search?: string;
  @ApiPropertyOptional({
    description: 'Role of the user',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Position of the user',
    example: 'manager',
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({
    description: 'Employee code of the user',
    example: 'EMP12345',
  })
  @IsOptional()
  @IsString()
  employee_code?: string;
  @ApiPropertyOptional({
    description: 'Status of the user (true = active)',
    example: true,
  })
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  is_active?: boolean;
}
