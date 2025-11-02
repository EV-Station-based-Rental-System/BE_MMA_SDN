import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsMongoId, IsNumber } from "class-validator";
import { RentalUntil } from "src/common/enums/booking.enum";
import { PaymentMethod } from "src/common/enums/payment.enum";

export class CreateBookingDto {
  @ApiProperty({
    description: "Payment method",
    example: "bank_transfer",
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({
    description: "Total amount for the booking",
    example: 100000,
  })
  @IsNumber()
  total_amount: number;

  @ApiProperty({
    description: "Vehicle ID",
    example: "vehicle_id",
  })
  @IsMongoId()
  vehicle_id: string;

  @ApiProperty({
    description: "Expected rental start datetime",
    example: "2025-10-20T10:00:00.000Z",
  })
  @IsDateString()
  rental_start_datetime: string;

  @ApiProperty({
    description: "Expected return datetime",
    example: "2025-10-25T10:00:00.000Z",
  })
  @IsDateString()
  expected_return_datetime: string;

  @ApiProperty({
    description: "Unit of rental duration (hours or days)",
    example: "hours",
    enum: RentalUntil,
  })
  @IsEnum(RentalUntil)
  rental_until: RentalUntil;
}
