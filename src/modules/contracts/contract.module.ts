import { Module } from "@nestjs/common";
import { ContractService } from "./contract.service";
import { ContractController } from "./contract.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Contract, ContractSchema } from "src/models/contract.schema";
import { RentalModule } from "../rentals/rental.module";
import { ImagekitModule } from "src/common/imagekit/imagekit.module";
import { Rental, RentalSchema } from "src/models/rental.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contract.name, schema: ContractSchema },
      { name: Rental.name, schema: RentalSchema },
    ]),
    RentalModule,
    ImagekitModule,
  ],
  controllers: [ContractController],
  providers: [ContractService],
})
export class ContractModule {}
