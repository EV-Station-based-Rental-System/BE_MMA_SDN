import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsOptional, IsDateString } from "class-validator";
import { BookingStatus, BookingVerificationStatus } from "src/common/enums/booking.enum";
import { BasePaginationDto } from "../basePagination.dto";

export class BookingPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({ description: "Filter by booking status", enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ description: "Filter by verification status", enum: BookingVerificationStatus })
  @IsOptional()
  @IsEnum(BookingVerificationStatus)
  verification_status?: BookingVerificationStatus;

  @ApiPropertyOptional({ description: "Filter by renter id", example: "64f1c2a7e5a9b2d4f8e1a2b3" })
  @IsOptional()
  @IsMongoId()
  renter_id?: string;

  @ApiPropertyOptional({ description: "Filter by vehicle_at_station id", example: "64f1c2a7e5a9b2d4f8e1a2b4" })
  @IsOptional()
  @IsMongoId()
  vehicle_at_station_id?: string;

  @ApiPropertyOptional({ description: "Filter by staff verifier id", example: "64f1c2a7e5a9b2d4f8e1a2b5" })
  @IsOptional()
  @IsMongoId()
  verified_by_staff_id?: string;

  @ApiPropertyOptional({ description: "Created at >= (ISO string)", example: "2025-01-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  created_from?: string;

  @ApiPropertyOptional({ description: "Created at <= (ISO string)", example: "2025-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsDateString()
  created_to?: string;
}
