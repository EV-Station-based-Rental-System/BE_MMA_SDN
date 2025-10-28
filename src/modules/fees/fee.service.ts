import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Fee } from "src/models/fee.schema";
import { CreateFeeDto } from "./dto/fee.dto";

@Injectable()
export class FeeService {
  constructor(@InjectModel(Fee.name) private feeRepository: Model<Fee>) {}

  async create(createFeeDto: CreateFeeDto) {
    const newFee = new this.feeRepository(createFeeDto);
    return await newFee.save();
  }
}
