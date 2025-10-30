import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Rental, RentalSchema } from "src/models/rental.schema";
import { RentalService } from "./rental.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: Rental.name, schema: RentalSchema }])],
  providers: [RentalService],
  exports: [RentalService],
})
export class RentalModule {}
