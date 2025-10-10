import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Vehicle, VehicleSchema } from "src/models/vehicle.schema";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { VehiclesService } from "./vehicles.service";
import { VehiclesController } from "./vehicles.controller";

@Module({
  imports: [MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }])],
  controllers: [VehiclesController],
  providers: [VehiclesService, JwtAuthGuard, RolesGuard],
})
export class VehiclesModule {}
