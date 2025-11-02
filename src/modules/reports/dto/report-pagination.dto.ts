import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsMongoId, IsOptional } from "class-validator";
import { BasePaginationDto } from "src/common/pagination/dto/basePagination.dto";

export class ReportPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({ description: "Filter reports by inspection", example: "6714b621a2ce5b57b9e3d5f1" })
  @IsOptional()
  @IsMongoId()
  inspection_id?: string;

  @ApiPropertyOptional({ description: "Filter by whether damage was found", example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  damage_found?: boolean;
}
