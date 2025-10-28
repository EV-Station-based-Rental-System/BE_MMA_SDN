import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { InspectionsService } from "./inspections.service";
import { InspectionsController } from "./inspections.controller";
import { Inspection, InspectionSchema } from "src/models/inspections.schema";
import { Rental, RentalSchema } from "src/models/rental.schema";
import { Report, ReportSchema } from "src/models/report.schema";
import { ReportsPhoto, ReportsPhotoSchema } from "src/models/reports_photo.schema";
import { ImagekitModule } from "src/common/imagekit/imagekit.module";
import { BookingModule } from "../bookings/booking.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inspection.name, schema: InspectionSchema },
      { name: Rental.name, schema: RentalSchema },
      { name: Report.name, schema: ReportSchema },
      { name: ReportsPhoto.name, schema: ReportsPhotoSchema },
    ]),
    ImagekitModule,
    BookingModule,
  ],
  controllers: [InspectionsController],
  providers: [InspectionsService],
  exports: [InspectionsService],
})
export class InspectionsModule {}
