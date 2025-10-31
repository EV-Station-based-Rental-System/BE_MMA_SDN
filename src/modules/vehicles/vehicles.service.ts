import { Injectable } from "@nestjs/common";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Vehicle } from "src/models/vehicle.schema";
import mongoose, { Model } from "mongoose";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { FacetResult } from "src/common/utils/type";
import { applyCommonFiltersMongo } from "src/common/pagination/applyCommonFilters";
import { applyFacetMongo } from "src/common/pagination/applyFacetMongo";
import { applyPaginationMongo } from "src/common/pagination/applyPagination";
import { applySortingMongo } from "src/common/pagination/applySorting";
import { VehiclePaginationDto } from "src/common/pagination/dto/vehicle/vehicle-pagination.dto";
import { VehicleFieldMapping } from "src/common/pagination/filters/vehicle-field-mapping";
import { ResponseList } from "src/common/response/response-list";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseMsg } from "src/common/response/response-message";
import { buildPaginationResponse } from "src/common/pagination/pagination-response";

interface VehicleWithPricing extends Vehicle {
  station?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    is_active: boolean;
  };
  pricing?: {
    _id: mongoose.Types.ObjectId;
    vehicle_id: mongoose.Types.ObjectId;
    price_per_day: number;
    deposit_amount: number;
    effective_from: Date;
    effective_to: Date | null;
    late_return_fee_per_hour: number;
    mileage_limit_per_day: number;
    excess_mileage_fee: number;
  };
}

@Injectable()
export class VehicleService {
  constructor(@InjectModel(Vehicle.name) private vehicleRepository: Model<Vehicle>) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<ResponseDetail<Vehicle>> {
    const newVehicle = new this.vehicleRepository(createVehicleDto);
    const savedVehicle = await newVehicle.save();
    return ResponseDetail.ok(savedVehicle);
  }

  async findAll(filters: VehiclePaginationDto): Promise<ResponseList<Vehicle>> {
    const pipeline: any[] = [];

    applyCommonFiltersMongo(pipeline, filters, VehicleFieldMapping);
    const allowedSortFields = ["model_year", "create_at"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "create_at");
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);
    const result = (await this.vehicleRepository.aggregate(pipeline)) as FacetResult<Vehicle>;
    const vehicles = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;
    return ResponseList.ok<Vehicle>(
      buildPaginationResponse(vehicles, {
        total,
        page: filters.page,
        take: filters.take,
      }),
    );
  }

  async findOne(id: string): Promise<ResponseDetail<Vehicle>> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) throw new NotFoundException("Vehicle not found");
    return ResponseDetail.ok(vehicle);
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<ResponseDetail<Vehicle>> {
    const updatedVehicle = await this.vehicleRepository.findByIdAndUpdate(id, updateVehicleDto, { new: true });
    if (!updatedVehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    return ResponseDetail.ok(updatedVehicle);
  }

  async softDelete(id: string): Promise<ResponseMsg> {
    await this.vehicleRepository.findByIdAndUpdate(id, { is_active: false }, { new: true });
    return ResponseMsg.ok("Vehicle soft-deleted successfully");
  }

  async hardDelete(id: string): Promise<ResponseMsg> {
    await this.vehicleRepository.findByIdAndDelete(id);
    return ResponseMsg.ok("Vehicle hard-deleted successfully");
  }

  async findOneWithPricing(id: string): Promise<VehicleWithPricing | null> {
    const currentDate = new Date();
    const pipeline: any[] = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "stations",
          localField: "station_id",
          foreignField: "_id",
          as: "station",
        },
      },
      {
        $addFields: {
          station: { $arrayElemAt: ["$station", 0] },
        },
      },
      {
        $lookup: {
          from: "pricings",
          localField: "_id",
          foreignField: "vehicle_id",
          as: "pricing_all",
        },
      },
      {
        $addFields: {
          pricing: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$pricing_all",
                  as: "price",
                  cond: {
                    $and: [
                      { $lte: ["$$price.effective_from", currentDate] },
                      {
                        $or: [{ $eq: ["$$price.effective_to", null] }, { $gte: ["$$price.effective_to", currentDate] }],
                      },
                    ],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: { pricing_all: 0 },
      },
    ];
    const result = await this.vehicleRepository.aggregate(pipeline);
    return (result[0] as VehicleWithPricing) || null;
  }

  async updateVehicleStatus(id: string, updateData: Partial<Vehicle>): Promise<Vehicle | null> {
    const updatedVehicle = await this.vehicleRepository.findByIdAndUpdate(id, updateData, { new: true });
    return updatedVehicle;
  }
}
