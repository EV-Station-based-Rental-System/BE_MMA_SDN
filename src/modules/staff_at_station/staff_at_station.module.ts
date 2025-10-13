import { Module } from "@nestjs/common";
import { StaffAtStationService } from "./staff_at_station.service";
import { StaffAtStationController } from "./staff_at_station.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { StaffAtStation, StaffAtStationSchema } from "src/models/staff_at_station.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: StaffAtStation.name, schema: StaffAtStationSchema }])],
  controllers: [StaffAtStationController],
  providers: [StaffAtStationService],
})
export class StaffAtStationModule {}
