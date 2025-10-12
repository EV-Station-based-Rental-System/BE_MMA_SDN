import { Transform } from "class-transformer";
import { IsOptional, IsBoolean, IsString } from "class-validator";
import { BasePaginationDto } from "../basePagination.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { toBoolean } from "src/common/utils/helper";

export class StationPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({
    description: "Search term to filter results",
    example: "name | address ",
  })
  @IsOptional()
  @IsString()
  search?: string;
  @ApiPropertyOptional({
    description: "Status of the Station (true = active)",
    example: true,
  })
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  is_active?: boolean;
}
