import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsOptional, IsNumber, IsBoolean, IsString } from "class-validator";
import { BasePaginationDto } from "../basePagination.dto";
import { toBoolean } from "src/common/utils/helper";

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  is_active?: boolean;
}
