import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsMongoId, IsOptional } from "class-validator";
import { RentalStatus } from "src/common/enums/rental.enum";
import { BasePaginationDto } from "../basePagination.dto";

export class RentalPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({ description: "Filter by rental status", enum: RentalStatus })
  @IsOptional()
  @IsEnum(RentalStatus)
  status?: RentalStatus;

  @ApiPropertyOptional({ description: "Filter by booking id", example: "64f1c2a7e5a9b2d4f8e1a2b6" })
  @IsOptional()
  @IsMongoId()
  booking_id?: string;

  @ApiPropertyOptional({ description: "Filter by vehicle id", example: "64f1c2a7e5a9b2d4f8e1a2b7" })
  @IsOptional()
  @IsMongoId()
  vehicle_id?: string;

  @ApiPropertyOptional({ description: "Filter rentals created after this timestamp", example: "2025-01-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  created_from?: string;

  @ApiPropertyOptional({ description: "Filter rentals created before this timestamp", example: "2025-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsDateString()
  created_to?: string;
}
