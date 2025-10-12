import { Module } from "@nestjs/common";
import { VehicleService } from "./vehicles.service";
import { VehicleController } from "./vehicles.controller";
import { Vehicle, VehicleSchema } from "src/models/vehicle.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }])],
  controllers: [VehicleController],
  providers: [VehicleService],
})
export class VehicleModule {}
