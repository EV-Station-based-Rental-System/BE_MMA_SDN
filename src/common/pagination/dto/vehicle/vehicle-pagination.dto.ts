import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsOptional, IsNumber, IsBoolean, IsString, IsEnum } from "class-validator";
import { BasePaginationDto } from "../basePagination.dto";
import { toBoolean } from "src/common/utils/helper";
import { VehicleStatus } from "src/common/enums/vehicle.enum";

export class VehiclePaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({
    description: "Search term to filter results",
    example: "make | model",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Year of the vehicle model",
    example: 2021,
  })
  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "created_at | model_year",
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  model_year?: number;

  @ApiPropertyOptional({
    description: "Status of the vehicle (true = active)",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }): boolean | undefined => {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      return toBoolean(value);
    }
    return undefined;
  })
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: "Operational status of the vehicle",
    enum: VehicleStatus,
    example: VehicleStatus.AVAILABLE,
  })
  @IsOptional()
  @Transform(({ value }): VehicleStatus | undefined => {
    if (typeof value === "string") {
      return value.toLowerCase() as VehicleStatus;
    }
    return undefined;
  })
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
