import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateVehicleDto {
  @ApiPropertyOptional({ description: "Vehicle manufacturer" })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ description: "Vehicle model" })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: "Manufacturing year" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  model_year?: number;

  @ApiPropertyOptional({ description: "Vehicle category" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: "Battery capacity in kWh" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  battery_capacity_kwh?: number;

  @ApiPropertyOptional({ description: "Estimated driving range in km" })
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
