import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Pricing } from "src/models/pricings.schema";
import { Vehicle } from "src/models/vehicle.schema";
import { CreatePricingDto } from "./dto/createPricing.dto";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseMsg } from "src/common/response/response-message";

@Injectable()
export class PricingService {
  constructor(
    @InjectModel(Pricing.name) private readonly pricingRepository: Model<Pricing>,
    @InjectModel(Vehicle.name) private readonly vehicleRepository: Model<Vehicle>,
  ) {}

  async create(CreatePricingDto: CreatePricingDto): Promise<ResponseDetail<Pricing>> {
    // check vehicle exists
    const vehicle = await this.vehicleRepository.findById(CreatePricingDto.vehicle_id);
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    const newPricing = new this.pricingRepository(CreatePricingDto);
    const savedPricing = await newPricing.save();
    return ResponseDetail.ok(savedPricing);
  }

  async update(id: string, updatePricingDto: CreatePricingDto): Promise<ResponseDetail<Pricing>> {
    const updatedPricing = await this.pricingRepository.findByIdAndUpdate(id, updatePricingDto, { new: true });
    if (!updatedPricing) {
      throw new NotFoundException("Pricing not found");
    }
    return ResponseDetail.ok(updatedPricing);
  }

  async delete(id: string): Promise<ResponseMsg> {
    const deletedPricing = await this.pricingRepository.findByIdAndDelete(id);
    if (!deletedPricing) {
      throw new NotFoundException("Pricing not found");
    }
    return ResponseMsg.ok("Pricing deleted successfully");
  }
}
