import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationDto } from '../basePagination.dto';

export class StaffAtStationPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({
    description: 'Search term to filter by staff info (email, full_name, phone_number)',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  searchStaff?: string;

  @ApiPropertyOptional({
    description: 'Search term to filter by station name',
    example: 'Main Station',
  })
  @IsOptional()
  @IsString()
  searchStation?: string;

  @ApiPropertyOptional({
    description: 'Filter by start time from (ISO date string)',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fromStartTime?: string;

  @ApiPropertyOptional({
    description: 'Filter by end time to (ISO date string)',
    example: '2025-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  toEndTime?: string;
}
