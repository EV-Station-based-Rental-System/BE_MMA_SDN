import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsDateString, IsString } from 'class-validator';

export class CreateStaffAtStationDto {
  @ApiProperty({
    description: 'Staff ID)',
    example: '652ab1234f1e8b0012abcd34',
  })
  @IsString({ message: 'Staff ID is string' })
  @IsNotEmpty({ message: 'Staff ID is required' })
  staff_id: string;

  @ApiProperty({
    description: 'Station ID (ObjectId as string)',
    example: '652ab5678f1e8b0012abcd78',
  })
  @IsString({ message: 'station_id must be a string' })
  @IsNotEmpty({ message: 'station_id is required' })
  station_id: string;

  @ApiPropertyOptional({
    description: 'Start working time at the station',
    example: '2025-10-13T08:30:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'start_time must be a valid date (ISO string)' })
  start_time?: string;

  @ApiPropertyOptional({
    description: 'End working time at the station',
    example: '2025-12-31T17:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'end_time must be a valid date (ISO string)' })
  end_time?: string;

  @ApiPropertyOptional({
    description: 'Role of the staff at the station',
    example: 'maintenance_staff',
  })
  @IsOptional()
  @IsString({ message: 'role_at_station must be a string' })
  role_at_station?: string;
}
