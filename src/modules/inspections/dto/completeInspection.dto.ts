import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CompleteInspectionDto {
  @ApiProperty({
    description: "Có phát hiện hư hỏng không",
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  damage_found: boolean;

  @ApiProperty({
    description: "Ghi chú về hư hỏng (nếu có)",
    example: "Vết xước nhỏ ở cửa phía trước",
    required: false,
  })
  @IsOptional()
  @IsString()
  damage_notes?: string;

  @ApiProperty({
    description: "Giá trị ước tính thiệt hại (VND)",
    example: 500000,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  damage_price?: number;

  @ApiProperty({
    description: "Thiệt hại có vượt quá tiền cọc không",
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_over_deposit?: boolean;

  @ApiProperty({
    description: "Số tiền vượt quá tiền cọc (nếu có)",
    example: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  over_deposit_fee_amount?: number;
}
