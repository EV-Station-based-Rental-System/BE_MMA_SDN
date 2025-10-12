import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/models/user.schema";
import { Admin, AdminSchema } from "src/models/admin.schema";
import { Renter, RenterSchema } from "src/models/renter.schema";
import { Staff, StaffSchema } from "src/models/staff.schema";
import { Booking, BookingSchema } from "src/models/booking.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Renter.name, schema: RenterSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
