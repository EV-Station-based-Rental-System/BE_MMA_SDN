import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber } from "class-validator";

export class UpdateStationDto {
  @ApiPropertyOptional({ description: "Name Station", example: "Hồ Chí Minh" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Address", example: "123 Nguyễn Trãi, Q1" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: "Latitude", example: 10.762622 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: "Longitude", example: 106.660172 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
