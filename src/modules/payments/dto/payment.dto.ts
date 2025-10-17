import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { PaymentMethod, PaymentStatus } from "src/common/enums/payment.enum";

export class PaymentDto {
  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.UNKNOWN })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus, default: PaymentStatus.PAID })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({ description: "Amount paid (VND)", example: 250000 })
  @IsInt()
  amount_paid: number;

  @ApiProperty({ description: "Transaction code", required: false, example: "TXN-20251020-0001" })
  @IsOptional()
  @IsString()
  transaction_code?: string;
}
