import { Module } from "@nestjs/common";
import { MomoService } from "./momo.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Payment, PaymentSchema } from "src/models/payment.schema";
import { Vehicle, VehicleSchema } from "src/models/vehicle.schema";
import { Booking, BookingSchema } from "src/models/booking.schema";
import { Renter, RenterSchema } from "src/models/renter.schema";
import { User, UserSchema } from "src/models/user.schema";
import { MailModule } from "src/common/mail/mail.module";
import { MomoController } from "./momo.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Renter.name, schema: RenterSchema },
      { name: User.name, schema: UserSchema },
    ]),
    MailModule,
  ],
  providers: [MomoService],
  controllers: [MomoController],
  exports: [MomoService],
})
export class MomoModule {}
