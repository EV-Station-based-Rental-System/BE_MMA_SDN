import { Injectable } from "@nestjs/common";
import { CreateRentalDto } from "./dto/createRental.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Rental } from "src/models/rental.schema";
import { Model } from "mongoose";

@Injectable()
export class RentalService {
  constructor(@InjectModel(Rental.name) private readonly rentalRepository: Model<Rental>) {}
  async create(createRentalDto: CreateRentalDto): Promise<void> {
    const createdRental = new this.rentalRepository(createRentalDto);
    await createdRental.save();
  }
}
