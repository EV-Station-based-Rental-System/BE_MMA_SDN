import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaymentMethod, PaymentStatus } from "src/common/enums/payment.enum";
import { BasePaginationDto } from "../basePagination.dto";

export class PaymentPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({ description: "Filter by payment status", enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: "Filter by payment method", enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ description: "Filter by transaction code", example: "TXN-20251020-0001" })
  @IsOptional()
  @IsString()
  transaction_code?: string;
}
