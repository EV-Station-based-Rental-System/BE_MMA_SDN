import { ApiPropertyOptional } from "@nestjs/swagger";
import { BasePaginationDto } from "../basePagination.dto";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class VehicleAtStationPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({
    description: "Search term to filter results",
    example: "make | model",
  })
  @IsOptional()
  @IsString()
  searchCar?: string;
  @ApiPropertyOptional({
    description: "Year of the vehicle model",
    example: 2021,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  model_year?: number;

  @ApiPropertyOptional({
    description: "Station Name to filter results",
    example: "Main Station",
  })
  @IsOptional()
  @IsString()
  searchStation?: string;
}
