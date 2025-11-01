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
import { VehicleWithPricingAndStation } from "./dto/get-vehicle-respone.dto";
import { CreateVehicleWithStationAndPricingDto } from "./dto/create-vehicle-with-station-pricing.dto";
import { StationService } from "../stations/stations.service";
import { PricingService } from "../pricings/pricing.service";

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleRepository: Model<Vehicle>,
    private readonly stationService: StationService,
    private readonly pricingService: PricingService,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<ResponseDetail<Vehicle>> {
    const newVehicle = new this.vehicleRepository(createVehicleDto);
    const savedVehicle = await newVehicle.save();
    return ResponseDetail.ok(savedVehicle);
  }

  async createWithStationAndPricing(createDto: CreateVehicleWithStationAndPricingDto): Promise<ResponseDetail<VehicleWithPricingAndStation>> {
    // Step 1: Verify the station exists
    const stationResponse = await this.stationService.findOne(createDto.station_id);
    if (!stationResponse.data) {
      throw new NotFoundException("Station not found");
    }

    // Step 2: Create the vehicle with the station_id
    const stationId = new mongoose.Types.ObjectId(createDto.station_id);
    const vehicleData = {
      ...createDto.vehicle,
      station_id: stationId,
    };
    const newVehicle = new this.vehicleRepository(vehicleData);
    const savedVehicle = await newVehicle.save();

    // Step 3: Create the pricing with the vehicle_id
    const pricingData = {
      ...createDto.pricing,
      vehicle_id: savedVehicle._id.toString(),
    };
    await this.pricingService.create(pricingData);

    // Step 4: Fetch the complete vehicle with station and pricing
    const vehicleWithDetails = await this.findOneWithPricingAndStation(savedVehicle._id.toString());

    if (!vehicleWithDetails) {
      throw new NotFoundException("Failed to retrieve created vehicle with details");
    }

    return ResponseDetail.ok(vehicleWithDetails);
  }

  async findAll(filters: VehiclePaginationDto): Promise<ResponseList<VehicleWithPricingAndStation>> {
    const pipeline: any[] = [];
    const currentDate = new Date();

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

    // Add lookup for current pricing using robust pipeline (treat null effective_to as open-ended)
    pipeline.push(
      {
        $lookup: {
          from: "pricings",
          let: { v_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$vehicle_id", "$$v_id"] } } },
            { $match: { $expr: { $lte: ["$effective_from", currentDate] } } },
            { $match: { $expr: { $gte: [{ $ifNull: ["$effective_to", currentDate] }, currentDate] } } },
            { $sort: { effective_from: -1 } },
            { $limit: 1 },
          ],
          as: "pricing",
        },
      },
      { $addFields: { pricing: { $arrayElemAt: ["$pricing", 0] } } },
    );

    const allowedSortFields = ["model_year", "create_at"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "create_at");
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);
    const result = (await this.vehicleRepository.aggregate(pipeline)) as FacetResult<VehicleWithPricingAndStation>;
    const vehicles = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;
    return ResponseList.ok<VehicleWithPricingAndStation>(
      buildPaginationResponse(vehicles, {
        total,
        page: filters.page,
        take: filters.take,
      }),
    );
  }

  async findOne(id: string): Promise<ResponseDetail<VehicleWithPricingAndStation>> {
    const vehicle = await this.findOneWithPricingAndStation(id);
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

  async findOneWithPricingAndStation(id: string, effectiveAt?: Date): Promise<VehicleWithPricingAndStation | null> {
    console.log("id ne: ", id);

    console.warn("Finding vehicle with pricing and station findOneWithPricingAndStation");

    const currentDate = effectiveAt ?? new Date();
    const pipeline: any[] = [
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
      // Lookup current pricing (by effective date) using lookup pipeline for robustness
      {
        $lookup: {
          from: "pricings",
          let: { v_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$vehicle_id", "$$v_id"] },
              },
            },
            {
              $match: {
                $expr: { $lte: ["$effective_from", currentDate] },
              },
            },
            {
              $match: {
                $expr: {
                  $gte: [{ $ifNull: ["$effective_to", currentDate] }, currentDate],
                },
              },
            },
            { $sort: { effective_from: -1 } },
            { $limit: 1 },
          ],
          as: "pricing",
        },
      },
      {
        $addFields: {
          pricing: { $arrayElemAt: ["$pricing", 0] },
        },
      },
    ];
    const result = await this.vehicleRepository.aggregate(pipeline);
    return (result[0] as VehicleWithPricingAndStation) || null;
  }

  async updateVehicleStatus(id: string, updateData: Partial<Vehicle>): Promise<Vehicle | null> {
    const updatedVehicle = await this.vehicleRepository.findByIdAndUpdate(id, updateData, { new: true });
    return updatedVehicle;
  }
}
