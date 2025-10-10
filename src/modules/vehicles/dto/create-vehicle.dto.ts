import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateVehicleDto {
  @ApiProperty({ description: "Vehicle manufacturer" })
  @IsString()
  make: string;

  @ApiProperty({ description: "Vehicle model" })
  @IsString()
  model: string;

  @ApiProperty({ description: "Manufacturing year" })
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  model_year: number;

  @ApiPropertyOptional({ description: "Vehicle category", default: "EV" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: "Battery capacity in kWh", example: 75 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  battery_capacity_kwh?: number;

  @ApiPropertyOptional({ description: "Estimated driving range in km", example: 320 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  range_km?: number;

  @ApiPropertyOptional({ description: "Vehicle identification number" })
  @IsOptional()
  @IsString()
  vin_number?: string;
}
