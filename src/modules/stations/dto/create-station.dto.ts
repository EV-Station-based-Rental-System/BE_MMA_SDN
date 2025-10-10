import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateStationDto {
  @ApiProperty({ description: "Station name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Station address" })
  @IsString()
  address: string;

  @ApiProperty({ description: "Latitude coordinate", required: false, example: 37.7749 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: "Longitude coordinate", required: false, example: -122.4194 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;
}
