import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Booking, BookingSchema } from "src/models/booking.schema";
import { Renter, RenterSchema } from "src/models/renter.schema";
import { VehicleAtStation, VehicleAtStationSchema } from "src/models/vehicle_at_station.schema";
import { Staff, StaffSchema } from "src/models/staff.schema";
import { Rental, RentalSchema } from "src/models/rental.schema";
import { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Renter.name, schema: RenterSchema },
      { name: VehicleAtStation.name, schema: VehicleAtStationSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: Rental.name, schema: RentalSchema },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
