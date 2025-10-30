import { forwardRef, Module } from "@nestjs/common";
import { CashService } from "./cash.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Booking, BookingSchema } from "src/models/booking.schema";
import { Payment, PaymentSchema } from "src/models/payment.schema";
import { Renter, RenterSchema } from "src/models/renter.schema";
import { User, UserSchema } from "src/models/user.schema";
import { VehicleAtStation, VehicleAtStationSchema } from "src/models/vehicle_at_station.schema";
import { BookingModule } from "src/modules/bookings/booking.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: VehicleAtStation.name, schema: VehicleAtStationSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Renter.name, schema: RenterSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => BookingModule),
  ],
  providers: [CashService],
  exports: [CashService],
})
export class CashModule {}
