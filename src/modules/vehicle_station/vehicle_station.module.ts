import { Module } from "@nestjs/common";
import { VehicleStationService } from "./vehicle_station.service";
import { VehicleStationController } from "./vehicle_station.controller";
import { VehicleAtStation, VehicleAtStationSchema } from "src/models/vehicle_at_station.schema";
import { Vehicle, VehicleSchema } from "src/models/vehicle.schema";
import { Station, StationSchema } from "src/models/station.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { Pricing, PricingSchema } from "src/models/pricings.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VehicleAtStation.name, schema: VehicleAtStationSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Station.name, schema: StationSchema },
      { name: Pricing.name, schema: PricingSchema },
    ]),
  ],
  controllers: [VehicleStationController],
  providers: [VehicleStationService],
  exports: [VehicleStationService],
})
export class VehicleStationModule {}
