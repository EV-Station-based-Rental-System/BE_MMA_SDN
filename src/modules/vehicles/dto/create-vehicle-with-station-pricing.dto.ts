import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsMongoId, IsObject, ValidateNested } from "class-validator";
import { CreateVehicleDto } from "./create-vehicle.dto";
import { CreatePricingDto } from "src/modules/pricings/dto/createPricing.dto";

class CreatePricingWithoutVehicleIdDto extends OmitType(CreatePricingDto, ["vehicle_id"] as const) {}

export class CreateVehicleWithStationAndPricingDto {
  @ApiProperty({ description: "Vehicle details", type: CreateVehicleDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateVehicleDto)
  vehicle: CreateVehicleDto;

  @ApiProperty({ description: "Station ID", example: "507f1f77bcf86cd799439011" })
  @IsMongoId()
  station_id: string;

  @ApiProperty({ description: "Pricing details", type: CreatePricingWithoutVehicleIdDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CreatePricingWithoutVehicleIdDto)
  pricing: CreatePricingWithoutVehicleIdDto;
}
