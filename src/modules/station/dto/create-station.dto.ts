import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';


export class CreateStationDto {
  @ApiProperty({ description: 'Name Station', example: 'HCM' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Address', example: ' Q1' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: 'Latitude', example: 10.762622 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude', example: 106.660172 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
