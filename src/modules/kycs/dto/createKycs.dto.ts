import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, IsOptional, IsDateString } from "class-validator";
import { KycType } from "src/common/enums/kyc.enum";

export class CreateKycsDto {
  @ApiProperty({
    description: "Loại giấy tờ KYC",
    enum: KycType,
    example: KycType.DRIVER_LICENSE,
  })
  @IsNotEmpty()
  @IsEnum(KycType)
  type: KycType;

  @ApiProperty({
    description: "Số giấy tờ (CMND, CCCD, hộ chiếu...)",
    example: "123456789012",
  })
  @IsNotEmpty()
  @IsString()
  document_number: string;

  @ApiProperty({
    description: "Ngày hết hạn của giấy tờ (ISO 8601 format)",
    example: "1990-01-01",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "Expiry date must be a valid date (ISO 8601)" })
  expiry_date?: string;
}
