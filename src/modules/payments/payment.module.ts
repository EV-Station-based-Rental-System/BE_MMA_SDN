import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Payment, PaymentSchema } from "src/models/payment.schema";
import { PaymentService } from "./payment.service";
import { Vehicle, VehicleSchema } from "src/models/vehicle.schema";
import { Booking, BookingSchema } from "src/models/booking.schema";
import { Renter, RenterSchema } from "src/models/renter.schema";
import { User, UserSchema } from "src/models/user.schema";
import { CashModule } from "./cash/cash.module";
import { PaymentController } from "./payment.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Renter.name, schema: RenterSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CashModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
