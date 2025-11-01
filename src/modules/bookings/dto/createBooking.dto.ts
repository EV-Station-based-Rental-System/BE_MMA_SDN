import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsMongoId, IsNumber } from "class-validator";
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
    description:
      "Total amount to be charged. Must equal deposit_amount + (rental_days × price_per_day) based on the vehicle's active pricing. Rental days are calculated by ceiling the difference between start and end time.",
    example: 2050000,
  })
  @IsNumber()
  total_amount: number;
  @ApiProperty({
    description: "Vehicle ID returned by the vehicle endpoints",
    example: "690612a0e29fc4e4c647c16b",
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
}
