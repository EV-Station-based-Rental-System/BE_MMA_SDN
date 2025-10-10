import { Module } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { StationsService } from "./stations.service";
import { StationsController } from "./stations.controller";

@Module({
  controllers: [StationsController],
  providers: [StationsService, JwtAuthGuard, RolesGuard],
})
export class StationsModule {}
