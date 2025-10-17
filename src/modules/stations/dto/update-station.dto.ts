import { PartialType, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateStationDto } from "./create-station.dto";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateStationDto extends PartialType(CreateStationDto) {
  @ApiPropertyOptional({ description: "Is active", example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
