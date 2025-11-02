import { Module } from "@nestjs/common";
import { VehicleService } from "./vehicles.service";
import { VehicleController } from "./vehicles.controller";
import { Vehicle, VehicleSchema } from "src/models/vehicle.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { Station, StationSchema } from "src/models/station.schema";
import { StationService } from "../stations/stations.service";
import { ImagekitModule } from "src/common/imagekit/imagekit.module";
import { Booking, BookingSchema } from "src/models/booking.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Station.name, schema: StationSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    ImagekitModule,
  ],
  controllers: [VehicleController],
  providers: [VehicleService, StationService],
  exports: [VehicleService],
})
export class VehicleModule {}
