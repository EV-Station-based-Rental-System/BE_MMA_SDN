import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class StationResponseDto {
  @ApiProperty({ description: "Station document identifier" })
  _id: string;

  @ApiProperty({ description: "Stable station identifier" })
  station_id: string;

  @ApiProperty({ description: "Station name" })
  name: string;

  @ApiProperty({ description: "Station address" })
  address: string;

  @ApiPropertyOptional({ description: "Latitude coordinate" })
  latitude?: number;

  @ApiPropertyOptional({ description: "Longitude coordinate" })
  longitude?: number;

  @ApiProperty({ description: "Creation timestamp" })
  created_at: Date;
}
