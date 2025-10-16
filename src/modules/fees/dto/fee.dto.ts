import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsMongoId, IsOptional, IsString } from "class-validator";
import { FeeType } from "src/common/enums/fee.enum";

export class FeeDto {
  @ApiProperty({ description: "Booking ID", example: "64f1c2a7e5a9b2d4f8e1a2b7" })
  @IsMongoId()
  booking_id: string;

  @ApiProperty({ enum: FeeType })
  @IsEnum(FeeType)
  type: FeeType;

  @ApiProperty({ description: "Description", required: false, example: "Deposit for vehicle booking" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Amount (VND)", example: 500000 })
  @IsInt()
  amount: number;

  @ApiProperty({ description: "Currency", example: "VND", default: "VND" })
  @IsString()
  currency: string;
}

