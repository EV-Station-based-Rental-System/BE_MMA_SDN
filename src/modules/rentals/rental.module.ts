import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Rental, RentalSchema } from "src/models/rental.schema";
import { RentalService } from "./rental.service";
import { RentalController } from "./rental.controller";

@Module({
  imports: [MongooseModule.forFeature([{ name: Rental.name, schema: RentalSchema }])],
  providers: [RentalService],
  controllers: [RentalController],
  exports: [RentalService],
})
export class RentalModule {}
