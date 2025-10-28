import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Fee, FeeSchema } from "src/models/fee.schema";
import { FeeService } from "./fee.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: Fee.name, schema: FeeSchema }])],
  providers: [FeeService],
  exports: [FeeService],
})
export class FeeModule {}
