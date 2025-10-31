import { Module } from "@nestjs/common";
import { VehicleService } from "./vehicles.service";
import { VehicleController } from "./vehicles.controller";
import { Vehicle, VehicleSchema } from "src/models/vehicle.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { Station, StationSchema } from "src/models/station.schema";
import { Pricing, PricingSchema } from "src/models/pricings.schema";
import { StationService } from "../stations/stations.service";
import { PricingService } from "../pricings/pricing.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Station.name, schema: StationSchema },
      { name: Pricing.name, schema: PricingSchema },
    ]),
  ],
  controllers: [VehicleController],
  providers: [VehicleService, StationService, PricingService],
  exports: [VehicleService],
})
export class VehicleModule {}
