import { Injectable } from "@nestjs/common";
import { CreateRentalDto } from "./dto/createRental.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Rental } from "src/models/rental.schema";
import { Model, Types } from "mongoose";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { NotFoundException } from "src/common/exceptions/not-found.exception";

@Injectable()
export class RentalService {
  constructor(@InjectModel(Rental.name) private readonly rentalRepository: Model<Rental>) {}
  async create(createRentalDto: CreateRentalDto): Promise<void> {
    const createdRental = new this.rentalRepository(createRentalDto);
    await createdRental.save();
  }

  async findById(rentalId: string): Promise<ResponseDetail<Rental & { _id: Types.ObjectId }>> {
    const rental = await this.rentalRepository.findById(rentalId).exec();
    if (!rental) {
      throw new NotFoundException(`Rental with id ${rentalId} not found`);
    }
    return ResponseDetail.ok(rental as Rental & { _id: Types.ObjectId });
  }

  async getAllRentals(): Promise<ResponseDetail<Rental[]>> {
    const rentals = await this.rentalRepository.find().exec();
    return ResponseDetail.ok(rentals);
  }
}
