import { Module } from "@nestjs/common";
import { StationService } from "./stations.service";
import { StationController } from "./stations.controller";
import { Station, StationSchema } from "src/models/station.schema";
import { Vehicle, VehicleSchema } from "src/models/vehicle.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Station.name, schema: StationSchema },
      { name: Vehicle.name, schema: VehicleSchema },
    ]),
  ],
  controllers: [StationController],
  providers: [StationService],
})
export class StationModule {}
