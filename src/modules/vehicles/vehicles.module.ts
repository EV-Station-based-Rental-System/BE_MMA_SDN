import { Module } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { VehiclesService } from "./vehicles.service";
import { VehiclesController } from "./vehicles.controller";

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService, JwtAuthGuard, RolesGuard],
})
export class VehiclesModule {}
