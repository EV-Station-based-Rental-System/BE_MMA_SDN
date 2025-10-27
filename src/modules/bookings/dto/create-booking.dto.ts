import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsInt, IsMongoId, IsOptional, IsString } from "class-validator";
import { BookingStatus, BookingVerificationStatus } from "src/common/enums/booking.enum";

export class CreateBookingDto {
  @ApiProperty({ description: "Renter id", example: "64f1c2a7e5a9b2d4f8e1a2b3" })
  @IsMongoId()
  renter_id!: string;

  @ApiProperty({ description: "Vehicle at station id", example: "64f1c2a7e5a9b2d4f8e1a2b4" })
  @IsMongoId()
  vehicle_at_station_id!: string;

  @ApiPropertyOptional({ description: "Expected return datetime", example: "2025-10-20T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  expected_return_datetime?: string;

  @ApiProperty({ enum: BookingStatus, default: BookingStatus.PENDING_VERIFICATION })
  @IsOptional()
  @IsEnum(BookingStatus)
  status: BookingStatus = BookingStatus.PENDING_VERIFICATION;

  @ApiProperty({ enum: BookingVerificationStatus, default: BookingVerificationStatus.PENDING })
  @IsOptional()
  @IsEnum(BookingVerificationStatus)
  verification_status: BookingVerificationStatus = BookingVerificationStatus.PENDING;

  @ApiPropertyOptional({ description: "Verified by staff id", example: "64f1c2a7e5a9b2d4f8e1a2b5" })
  @IsOptional()
  @IsMongoId()
  verified_by_staff_id?: string;

  @ApiPropertyOptional({ description: "Verified at timestamp", example: "2025-10-20T09:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  verified_at?: string;

  @ApiPropertyOptional({ description: "Cancel reason", example: "Customer request" })
  @IsOptional()
  @IsString()
  cancel_reason?: string;

  @ApiProperty({ description: "Total booking fee amount", example: 150000 })
  @IsInt()
  total_booking_fee_amount!: number;

  @ApiProperty({ description: "Deposit fee amount", example: 50000 })
  @IsInt()
  deposit_fee_amount!: number;

  @ApiProperty({ description: "Rental fee amount", example: 100000 })
  @IsInt()
  rental_fee_amount!: number;
}
