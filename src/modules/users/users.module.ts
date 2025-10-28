import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User, UserSchema } from "src/models/user.schema";
import { Admin, AdminSchema } from "src/models/admin.schema";
import { Renter, RenterSchema } from "src/models/renter.schema";
import { Staff, StaffSchema } from "src/models/staff.schema";
import { Booking, BookingSchema } from "src/models/booking.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { Station, StationSchema } from "src/models/station.schema";
import { Kycs, KycsSchema } from "src/models/kycs.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Renter.name, schema: RenterSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Station.name, schema: StationSchema },
      { name: Kycs.name, schema: KycsSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
