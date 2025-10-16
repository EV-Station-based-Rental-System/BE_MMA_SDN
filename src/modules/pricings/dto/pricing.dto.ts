import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsMongoId, IsOptional } from "class-validator";

export class PricingDto {
  @ApiProperty({ description: "Vehicle ID", example: "64f1c2a7e5a9b2d4f8e1a2b6" })
  @IsMongoId()
  vehicle_id: string;

  @ApiProperty({ description: "Price per hour (VND)", example: 30000 })
  @IsInt()
  price_per_hour: number;

  @ApiProperty({ description: "Price per day (VND)", required: false, example: 500000 })
  @IsOptional()
  @IsInt()
  price_per_day?: number;

  @ApiProperty({ description: "Effective from", example: "2025-10-20T00:00:00.000Z" })
  @IsDateString()
  effective_from: string;

  @ApiProperty({ description: "Effective to", required: false, example: "2025-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @ApiProperty({ description: "Deposit amount (VND)", example: 1000000 })
  @IsInt()
  deposit_amount: number;

  @ApiProperty({ description: "Late return fee per hour (VND)", required: false, example: 50000 })
  @IsOptional()
  @IsInt()
  late_return_fee_per_hour?: number;

  @ApiProperty({ description: "Mileage limit per day (km)", required: false, example: 200 })
  @IsOptional()
  @IsInt()
  mileage_limit_per_day?: number;

  @ApiProperty({ description: "Excess mileage fee (VND)", required: false, example: 4000 })
  @IsOptional()
  @IsInt()
  excess_mileage_fee?: number;
}

