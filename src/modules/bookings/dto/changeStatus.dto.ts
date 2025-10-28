import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { BookingVerificationStatus } from "src/common/enums/booking.enum";

export class ChangeStatusBookingDto {
  @ApiProperty({
    description: "Booking verification status",
    enum: BookingVerificationStatus,
    example: BookingVerificationStatus.APPROVED,
    required: true,
  })
  @IsEnum(BookingVerificationStatus, {
    message: "Verification status must be one of: pending, approved, rejected_mismatch, rejected_other",
  })
  verification_status: BookingVerificationStatus;

  @ApiProperty({
    description: "Reason for rejection (required when status is rejected)",
    example: "when the booking is rejected_mismatch, this field is required",
    required: false,
  })
  @IsOptional()
  @IsString()
  cancel_reason?: string;
}
