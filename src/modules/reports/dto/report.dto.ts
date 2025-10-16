import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsMongoId, IsOptional, IsString } from "class-validator";

export class ReportDto {
  @ApiProperty({ description: "Inspection ID", example: "64f1c2a7e5a9b2d4f8e1a2b8" })
  @IsMongoId()
  inspection_id: string;

  @ApiProperty({ description: "Damage notes", required: false, example: "Scratch on rear bumper" })
  @IsOptional()
  @IsString()
  damage_notes?: string;

  @ApiProperty({ description: "Damage found", example: false })
  @IsBoolean()
  damage_found: boolean;

  @ApiProperty({ description: "Damage price (VND)", example: 0 })
  @IsInt()
  damage_price: number;

  @ApiProperty({ description: "Is over deposit", example: false })
  @IsBoolean()
  is_over_deposit: boolean;

  @ApiProperty({ description: "Over deposit fee amount (VND)", example: 0 })
  @IsInt()
  over_deposit_fee_amount: number;
}

