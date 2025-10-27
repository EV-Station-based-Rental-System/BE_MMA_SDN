import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Rental, RentalSchema } from "src/models/rental.schema";
import { Booking, BookingSchema } from "src/models/booking.schema";
import { Vehicle, VehicleSchema } from "src/models/vehicle.schema";
import { RentalsService } from "./rentals.service";
import { RentalsController } from "./rentals.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Rental.name, schema: RentalSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Vehicle.name, schema: VehicleSchema },
    ]),
  ],
  controllers: [RentalsController],
  providers: [RentalsService],
})
export class RentalsModule {}
