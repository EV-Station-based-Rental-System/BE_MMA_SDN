import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Booking, BookingSchema } from "src/models/booking.schema";
import { Kycs, KycsSchema } from "src/models/kycs.schema";
import { Renter, RenterSchema } from "src/models/renter.schema";
import { Payment, PaymentSchema } from "src/models/payment.schema";
import { Fee, FeeSchema } from "src/models/fee.schema";
import { Vehicle, VehicleSchema } from "src/models/vehicle.schema";
import { Station, StationSchema } from "src/models/station.schema";
import { Pricing, PricingSchema } from "src/models/pricings.schema";
import { VehicleStationModule } from "../vehicle_station/vehicle_station.module";
import { FeeModule } from "../fees/fee.module";
import { PaymentModule } from "../payments/payment.module";
import { MomoModule } from "../payments/momo/momo.module";
import { BookingService } from "./booking.service";
import { BookingController } from "./booking.controller";
import { UsersModule } from "../users/users.module";
import { RentalModule } from "../rentals/rental.module";
import { CashModule } from "../payments/cash/cash.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Kycs.name, schema: KycsSchema },
      { name: Renter.name, schema: RenterSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Fee.name, schema: FeeSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Station.name, schema: StationSchema },
      { name: Pricing.name, schema: PricingSchema },
    ]),
    forwardRef(() => CashModule),
    VehicleStationModule,
    FeeModule,
    PaymentModule,
    MomoModule,
    UsersModule,
    RentalModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
