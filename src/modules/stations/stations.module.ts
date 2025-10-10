import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Station, StationSchema } from "src/models/station.schema";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { StationsService } from "./stations.service";
import { StationsController } from "./stations.controller";

@Module({
  imports: [MongooseModule.forFeature([{ name: Station.name, schema: StationSchema }])],
  controllers: [StationsController],
  providers: [StationsService, JwtAuthGuard, RolesGuard],
})
export class StationsModule {}
