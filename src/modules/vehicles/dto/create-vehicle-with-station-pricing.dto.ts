import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsObject, ValidateNested } from "class-validator";
import { CreateVehicleDto } from "./create-vehicle.dto";
import { CreateStationDto } from "src/modules/stations/dto/create-station.dto";
import { CreatePricingDto } from "src/modules/pricings/dto/createPricing.dto";

class CreatePricingWithoutVehicleIdDto extends OmitType(CreatePricingDto, ["vehicle_id"] as const) {}

export class CreateVehicleWithStationAndPricingDto {
  @ApiProperty({ description: "Vehicle details", type: CreateVehicleDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateVehicleDto)
  vehicle: CreateVehicleDto;

  @ApiProperty({ description: "Station details", type: CreateStationDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateStationDto)
  station: CreateStationDto;

  @ApiProperty({ description: "Pricing details", type: CreatePricingWithoutVehicleIdDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CreatePricingWithoutVehicleIdDto)
  pricing: CreatePricingWithoutVehicleIdDto;
}
