import { Module } from "@nestjs/common";
import { StationService } from "./stations.service";
import { StationController } from "./stations.controller";
import { Station, StationSchema } from "src/models/station.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [MongooseModule.forFeature([{ name: Station.name, schema: StationSchema }])],
  controllers: [StationController],
  providers: [StationService],
})
export class StationModule {}
