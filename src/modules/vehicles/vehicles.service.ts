import { Injectable } from "@nestjs/common";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Vehicle } from "src/models/vehicle.schema";
import mongoose, { Model } from "mongoose";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { FacetResult, VehicleAggregateResult } from "src/common/utils/type";
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
// import { VehicleWithPricingAndStation } from "./dto/get-vehicle-respone.dto";
import { StationService } from "../stations/stations.service";

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleRepository: Model<Vehicle>,
    private readonly stationService: StationService,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<ResponseDetail<Vehicle>> {
    // check vin number unique
    const existingVehicle = await this.vehicleRepository.findOne({ vin_number: createVehicleDto.vin_number });
    if (existingVehicle) {
      throw new NotFoundException("VIN number already exists");
    }
    const newVehicle = new this.vehicleRepository(createVehicleDto);
    const savedVehicle = await newVehicle.save();
    return ResponseDetail.ok(savedVehicle);
  }

  // async createWithStationAndPricing(createDto: CreateVehicleWithStationAndPricingDto): Promise<ResponseDetail<VehicleWithPricingAndStation>> {
  //   // Step 1: Verify the station exists
  //   const stationResponse = await this.stationService.findOne(createDto.station_id);
  //   if (!stationResponse.data) {
  //     throw new NotFoundException("Station not found");
  //   }

  //   // Step 2: Create the vehicle with the station_id
  //   const stationId = new mongoose.Types.ObjectId(createDto.station_id);
  //   const vehicleData = {
  //     ...createDto.vehicle,
  //     station_id: stationId,
  //   };
  //   const newVehicle = new this.vehicleRepository(vehicleData);
  //   const savedVehicle = await newVehicle.save();

  //   // Step 3: Create the pricing with the vehicle_id
  //   const pricingData = {
  //     ...createDto.pricing,
  //     vehicle_id: savedVehicle._id.toString(),
  //   };
  //   await this.pricingService.create(pricingData);

  //   // Step 4: Fetch the complete vehicle with station and pricing
  //   const vehicleWithDetails = await this.findOneWithPricingAndStation(savedVehicle._id.toString());

  //   if (!vehicleWithDetails) {
  //     throw new NotFoundException("Failed to retrieve created vehicle with details");
  //   }

  //   return ResponseDetail.ok(vehicleWithDetails);
  // }

  async findAll(filters: VehiclePaginationDto): Promise<ResponseList<VehicleAggregateResult>> {
    const pipeline: any[] = [];
    applyCommonFiltersMongo(pipeline, filters, VehicleFieldMapping);
    // Add lookup for station
    pipeline.push(
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
    );

    // Add lookup for current pricing

    const allowedSortFields = ["model_year", "create_at"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "create_at");
    pipeline.push({
      $project: {
        _id: 1,
        make: 1,
        model: 1,
        model_year: 1,
        category: 1,
        battery_capacity_kwh: 1,
        range_km: 1,
        vin_number: 1,
        img_url: 1,
        is_active: 1,
        current_battery_capacity_kwh: 1,
        current_mileage: 1,
        status: 1,
        price_per_hour: 1,
        price_per_day: 1,
        deposit_amount: 1,
        station: 1,
      },
    });
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);
    const result = (await this.vehicleRepository.aggregate(pipeline)) as FacetResult<VehicleAggregateResult>;
    const vehicles = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;
    return ResponseList.ok<VehicleAggregateResult>(
      buildPaginationResponse(vehicles, {
        total,
        page: filters.page,
        take: filters.take,
      }),
    );
  }

  async findOne(id: string): Promise<ResponseDetail<VehicleAggregateResult>> {
    const pipeline: any[] = [];
    pipeline.push(
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      // Lookup station information
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
        $project: {
          _id: 1,
          make: 1,
          model: 1,
          model_year: 1,
          category: 1,
          battery_capacity_kwh: 1,
          range_km: 1,
          vin_number: 1,
          img_url: 1,
          is_active: 1,
          current_battery_capacity_kwh: 1,
          current_mileage: 1,
          status: 1,
          price_per_hour: 1,
          price_per_day: 1,
          deposit_amount: 1,
          station: 1,
        },
      },
    );
    const result = await this.vehicleRepository.aggregate(pipeline);
    const vehicle = result[0] as VehicleAggregateResult;
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
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

  // async findOneWithPricingAndStation(id: string): Promise<VehicleWithPricingAndStation | null> {
  //   const currentDate = new Date();
  //   const pipeline: any[] = [
  //     {
  //       $match: {
  //         _id: new mongoose.Types.ObjectId(id),
  //       },
  //     },
  //     // Lookup station information
  //     {
  //       $lookup: {
  //         from: "stations",
  //         localField: "station_id",
  //         foreignField: "_id",
  //         as: "station",
  //       },
  //     },
  //     {
  //       $addFields: {
  //         station: { $arrayElemAt: ["$station", 0] },
  //       },
  //     },
  //     // Lookup current pricing
  //     {
  //       $lookup: {
  //         from: "pricings",
  //         localField: "_id",
  //         foreignField: "vehicle_id",
  //         as: "pricing_all",
  //       },
  //     },
  //     {
  //       $addFields: {
  //         pricing: {
  //           $arrayElemAt: [
  //             {
  //               $filter: {
  //                 input: {
  //                   $sortArray: {
  //                     input: "$pricing_all",
  //                     sortBy: { effective_from: -1 },
  //                   },
  //                 },
  //                 as: "price",
  //                 cond: {
  //                   $and: [
  //                     { $lte: ["$$price.effective_from", currentDate] },
  //                     {
  //                       $or: [{ $eq: ["$$price.effective_to", null] }, { $gte: ["$$price.effective_to", currentDate] }],
  //                     },
  //                   ],
  //                 },
  //               },
  //             },
  //             0,
  //           ],
  //         },
  //       },
  //     },
  //     {
  //       $project: { pricing_all: 0 },
  //     },
  //   ];
  //   const result = await this.vehicleRepository.aggregate(pipeline);
  //   return (result[0] as VehicleWithPricingAndStation) || null;
  // }

  async updateVehicleStatus(id: string, updateData: Partial<Vehicle>): Promise<Vehicle | null> {
    const updatedVehicle = await this.vehicleRepository.findByIdAndUpdate(id, updateData, { new: true });
    return updatedVehicle;
  }
}
