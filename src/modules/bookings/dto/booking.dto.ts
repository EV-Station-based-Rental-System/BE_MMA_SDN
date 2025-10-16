import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsInt, IsMongoId, IsOptional, IsString } from "class-validator";
import { BookingStatus, BookingVerificationStatus } from "src/common/enums/booking.enum";

export class BookingDto {
  @ApiProperty({ description: "Renter ID", example: "64f1c2a7e5a9b2d4f8e1a2b3" })
  @IsMongoId()
  renter_id: string;

  @ApiProperty({ description: "VehicleAtStation ID", example: "64f1c2a7e5a9b2d4f8e1a2b4" })
  @IsMongoId()
  vehicle_at_station_id: string;

  @ApiProperty({ description: "Expected return datetime", required: false, example: "2025-10-20T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  expected_return_datetime?: string;

  @ApiProperty({ enum: BookingStatus, default: BookingStatus.PENDING_VERIFICATION })
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiProperty({ enum: BookingVerificationStatus, default: BookingVerificationStatus.PENDING })
  @IsEnum(BookingVerificationStatus)
  verification_status: BookingVerificationStatus;

  @ApiProperty({ description: "Verified by staff ID", required: false, example: "64f1c2a7e5a9b2d4f8e1a2b5" })
  @IsOptional()
  @IsMongoId()
  verified_by_staff_id?: string;

  @ApiProperty({ description: "Verified at", required: false, example: "2025-10-20T09:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  verified_at?: string;

  @ApiProperty({ description: "Cancel reason", required: false, example: "Customer request" })
  @IsOptional()
  @IsString()
  cancel_reason?: string;

  @ApiProperty({ description: "Total booking fee amount (VND)", example: 150000 })
  @IsInt()
  total_booking_fee_amount: number;

  @ApiProperty({ description: "Deposit fee amount (VND)", example: 500000 })
  @IsInt()
  deposit_fee_amount: number;

  @ApiProperty({ description: "Rental fee amount (VND)", example: 100000 })
  @IsInt()
  rental_fee_amount: number;
}

