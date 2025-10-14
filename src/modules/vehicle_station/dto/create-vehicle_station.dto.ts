import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVehicleStationDto {
  @ApiProperty({
    description: 'Vehicle ID',
    example: 'vehicle_12345',
  })
  @IsString()
  vehicle_id: string;

  @ApiProperty({
    description: 'Station ID',
    example: 'station_67890',
  })
  @IsString()
  station_id: string;

  @ApiPropertyOptional({
    description: 'Time when the vehicle arrives at the station',
    example: '2025-10-13T08:30:00Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_time?: Date;

  @ApiPropertyOptional({
    description: 'Time when the vehicle departs from the station',
    example: '2025-10-13T09:00:00Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_time?: Date;

  @ApiPropertyOptional({
    description: 'Current battery capacity (kWh)',
    example: 45.5,
  })
  @IsOptional()
  @IsNumber()
  current_battery_capacity_kwh?: number;

  @ApiProperty({
    description: 'Current mileage of the vehicle (in km)',
    example: 12450,
  })
  @IsNumber()
  current_mileage: number;

  @ApiPropertyOptional({
    description: 'Status of the vehicle at the station',
    example: 'maintain | available | booked ',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
