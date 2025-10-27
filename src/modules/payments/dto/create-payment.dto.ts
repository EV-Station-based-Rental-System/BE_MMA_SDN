import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PaymentMethod, PaymentStatus } from "src/common/enums/payment.enum";

export class CreatePaymentDto {
  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.UNKNOWN })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus, default: PaymentStatus.PAID })
  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @ApiProperty({ description: "Amount paid", example: 250000 })
  @Type(() => Number)
  @IsNumber()
  amount_paid!: number;

  @ApiPropertyOptional({ description: "Transaction code", example: "TXN-20251020-0001" })
  @IsOptional()
  @IsString()
  transaction_code?: string;
}
