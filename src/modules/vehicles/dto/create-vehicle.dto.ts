import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateVehicleDto {
  @ApiProperty({ description: "Brand Car", example: "Tesla" })
  @IsString()
  make: string;

  @ApiProperty({ description: "Model", example: "Model 3" })
  @IsString()
  model: string;

  @ApiProperty({ description: "Year of Manufacture", example: 2025 })
  @IsNumber()
  @Type(() => Number)
  model_year: number;

  @ApiProperty({ description: "Vehicle Type", example: "EV", default: "EV" })
  @IsString()
  category: string;

  @ApiProperty({ description: "Battery Capacity (kWh)", example: 75, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  battery_capacity_kwh?: number;

  @ApiProperty({ description: "Maximum Range (km)", example: 500, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  range_km?: number;

  @ApiProperty({ description: "VIN Number", example: "5YJ3E1EA7KF317XXX" })
  @IsString()
  vin_number: string;

  @ApiProperty({ description: "Station ID", example: "station_id" })
  @IsString()
  station_id: string;

  @ApiProperty({ description: "Price per Hour", example: 50000 })
  @IsNumber()
  @Type(() => Number)
  price_per_hour: number;

  @ApiProperty({ description: "Price per Day", example: 300000 })
  @IsNumber()
  @Type(() => Number)
  price_per_day: number;

  @ApiProperty({ description: "Deposit Amount", example: 500000, default: 0 })
  @IsNumber()
  @Type(() => Number)
  deposit_amount: number;

  @ApiProperty({
    description: "Vehicle image file",
    type: "string",
    format: "binary",
    required: false,
  })
  @IsOptional()
  image?: any;

  @ApiProperty({
    description: "Image label/description",
    example: "Front view",
    required: false,
  })
  @IsOptional()
  @IsString()
  label?: string;
}
