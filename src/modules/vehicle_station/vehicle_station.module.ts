import { Module } from "@nestjs/common";
import { VehicleStationService } from "./vehicle_station.service";
import { VehicleStationController } from "./vehicle_station.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { VehicleAtStation, VehicleAtStationSchema } from "src/models/vehicle_at_station.schema";
import { Vehicle, VehicleSchema } from "src/models/vehicle.schema";
import { Station, StationSchema } from "src/models/station.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VehicleAtStation.name, schema: VehicleAtStationSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Station.name, schema: StationSchema },
    ]),
  ],
  controllers: [VehicleStationController],
  providers: [VehicleStationService],
})
export class VehicleStationModule {}
