import { Module } from "@nestjs/common";
import { StaffAtStationService } from "./staff_at_station.service";
import { StaffAtStationController } from "./staff_at_station.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { StaffAtStation, StaffAtStationSchema } from "src/models/staff_at_station.schema";
import { Staff, StaffSchema } from "src/models/staff.schema";
import { Station, StationSchema } from "src/models/station.schema";
import { User, UserSchema } from "src/models/user.schema";

@Module({
  imports: [MongooseModule.forFeature([
    { name: StaffAtStation.name, schema: StaffAtStationSchema },
    { name: Staff.name, schema: StaffSchema },
    { name: Station.name, schema: StationSchema },
    { name: User.name, schema: UserSchema },
  ])],
  controllers: [StaffAtStationController],
  providers: [StaffAtStationService],
})
export class StaffAtStationModule { }
