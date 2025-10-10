import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class VehicleResponseDto {
  @ApiProperty({ description: "Vehicle document identifier" })
  _id: string;

  @ApiProperty({ description: "Stable vehicle identifier" })
  vehicle_id: string;

  @ApiProperty({ description: "Vehicle manufacturer" })
  make: string;

  @ApiProperty({ description: "Vehicle model" })
  model: string;

  @ApiProperty({ description: "Manufacturing year" })
  model_year: number;

  @ApiProperty({ description: "Vehicle category", default: "EV" })
  category: string;

  @ApiPropertyOptional({ description: "Battery capacity in kWh" })
  battery_capacity_kwh?: number;

  @ApiPropertyOptional({ description: "Estimated range in km" })
  range_km?: number;

  @ApiPropertyOptional({ description: "Vehicle identification number" })
  vin_number?: string;

  @ApiProperty({ description: "Creation timestamp" })
  created_at: Date;
}
