import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsMongoId } from "class-validator";
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
    description: "VehicleAtStation ID",
    example: "64f1c2a7e5a9b2d4f8e1a2b4",
  })
  @IsMongoId()
  vehicle_at_station_id: string;

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
}
