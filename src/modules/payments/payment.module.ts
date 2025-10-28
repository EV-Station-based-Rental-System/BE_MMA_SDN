import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Payment, PaymentSchema } from "src/models/payment.schema";
import { PaymentService } from "./payment.service";
import { VehicleAtStation, VehicleAtStationSchema } from "src/models/vehicle_at_station.schema";
import { Booking, BookingSchema } from "src/models/booking.schema";
import { Renter, RenterSchema } from "src/models/renter.schema";
import { User, UserSchema } from "src/models/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: VehicleAtStation.name, schema: VehicleAtStationSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Renter.name, schema: RenterSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
