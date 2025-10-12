import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateVehicleDto {
  @ApiPropertyOptional({ description: "Brand Car", example: "Tesla" })
  @IsString()
  make?: string;

  @ApiPropertyOptional({ description: "Model", example: "Model 3" })
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: "Year of Manufacture", example: 2025 })
  @IsNumber()
  model_year?: number;

  @ApiPropertyOptional({ description: "Vehicle Type", example: "EV" })
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: "Battery Capacity (kWh)", example: 75 })
  @IsNumber()
  battery_capacity_kwh?: number;

  @ApiPropertyOptional({ description: "Maximum Range (km)", example: 500 })
  @IsNumber()
  range_km?: number;

  @ApiPropertyOptional({ description: "VIN Number", example: "5YJ3E1EA7KF317XXX" })
  @IsString()
  vin_number?: string;

  @ApiPropertyOptional({ description: "Image URL", example: "http://example.com/car.jpg", required: false })
  @IsOptional()
  @IsString()
  image_url?: string;
}
