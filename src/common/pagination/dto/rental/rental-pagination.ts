import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsDateString, IsEnum } from "class-validator";
import { BasePaginationDto } from "../basePagination.dto";
import { RentalStatus } from "src/common/enums/rental.enum";

export class RentalPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({
    description: "Tìm kiếm theo email hoặc full_name của renter",
    example: "Nguyen",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Trạng thái rental (reserved, in_progress, completed, cancelled)",
    enum: RentalStatus,
    example: RentalStatus.RESERVED,
  })
  @IsOptional()
  @IsEnum(RentalStatus)
  status?: RentalStatus;

  @ApiPropertyOptional({
    description: "Ngày bắt đầu lọc theo pickup_datetime (ISO format)",
    example: "2025-10-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  from_date?: Date;

  @ApiPropertyOptional({
    description: "Ngày kết thúc lọc theo pickup_datetime (ISO format)",
    example: "2025-10-31T23:59:59.000Z",
  })
  @IsOptional()
  @IsDateString()
  to_date?: Date;
}
