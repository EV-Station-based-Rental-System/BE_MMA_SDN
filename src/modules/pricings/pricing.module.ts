import { Module } from "@nestjs/common";
import { PricingService } from "./pricing.service";
import { PricingController } from "./pricing.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Pricing, PricingSchema } from "src/models/pricings.schema";
import { Vehicle, VehicleSchema } from "src/models/vehicle.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pricing.name, schema: PricingSchema },
      { name: Vehicle.name, schema: VehicleSchema },
    ]),
  ],
  providers: [PricingService],
  controllers: [PricingController],
})
export class PricingModule {}
