import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateStationDto {
  @ApiPropertyOptional({ description: "Station name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Station address" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: "Latitude coordinate", example: 37.7749 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: "Longitude coordinate", example: -122.4194 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;
}
