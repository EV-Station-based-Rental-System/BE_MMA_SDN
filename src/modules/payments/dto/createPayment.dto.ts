import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { PaymentMethod, PaymentStatus } from "src/common/enums/payment.enum";

export class CreatePaymentDto {
  @ApiProperty({ example: "671f9e5c1a2b6b001f2a1234", description: "ID của booking liên kết" })
  @IsMongoId()
  @IsNotEmpty()
  booking_id: string;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
    description: "Phương thức thanh toán (MOMO, VNPAY, CASH, ...)",
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    description: "Trạng thái thanh toán (PENDING, SUCCESS, FAILED, ...)",
    required: false,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty({ example: 250000, description: "Số tiền thanh toán" })
  @IsNumber()
  @IsNotEmpty()
  amount_paid: number;

  @ApiProperty({
    example: "momo-20251028-XYZ123",
    description: "Mã giao dịch từ cổng thanh toán (nếu có)",
    required: false,
  })
  @IsString()
  @IsOptional()
  transaction_code?: string;
}
