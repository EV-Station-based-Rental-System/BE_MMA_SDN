import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class QueryVehicleDto extends PaginationDto {
  @ApiPropertyOptional({ description: "Search term applied to make, model, and VIN" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: "Vehicle category" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: "Exact model year" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  model_year?: number;

  @ApiPropertyOptional({ description: "Minimum battery capacity in kWh" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_battery_kwh?: number;

  @ApiPropertyOptional({ description: "Minimum range in km" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_range_km?: number;
}
