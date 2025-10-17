import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateStationDto {
  @ApiProperty({ description: "Name Station", example: "HCM" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Address", example: "Q1" })
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: "Latitude", example: 10.762622 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false }, { each: false })
  latitude?: number;

  @ApiPropertyOptional({ description: "Longitude", example: 106.660172 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false }, { each: false })
  longitude?: number;

  // Optional: only if you want clients to control active status on create
  // @ApiPropertyOptional({ description: "Is active", example: true, default: true })
  // @IsOptional()
  // @IsBoolean()
  // is_active?: boolean;
}
