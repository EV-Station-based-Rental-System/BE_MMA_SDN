import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Report, ReportSchema } from "src/models/report.schema";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";

@Module({
  imports: [MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
