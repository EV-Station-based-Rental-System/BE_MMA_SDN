import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional } from "class-validator";

export class CreateVehicleDto {
  @ApiProperty({ description: "Brand Car", example: "Tesla" })
  @IsString()
  make: string;

  @ApiProperty({ description: "Model", example: "Model 3" })
  @IsString()
  model: string;

  @ApiProperty({ description: "Year of Manufacture", example: 2025 })
  @IsNumber()
  model_year: number;

  @ApiProperty({ description: "Vehicle Type", example: "EV", default: "EV" })
  @IsString()
  category: string;

  @ApiProperty({ description: "Battery Capacity (kWh)", example: 75, required: false })
  @IsOptional()
  @IsNumber()
  battery_capacity_kwh?: number;

  @ApiProperty({ description: "Maximum Range (km)", example: 500, required: false })
  @IsOptional()
  @IsNumber()
  range_km?: number;

  @ApiProperty({ description: "VIN Number", example: "5YJ3E1EA7KF317XXX", required: false })
  @IsOptional()
  @IsString()
  vin_number?: string;

  @ApiProperty({ description: "Image URL", example: "http://example.com/car.jpg", required: false })
  @IsOptional()
  @IsString()
  img_url?: string;
}
