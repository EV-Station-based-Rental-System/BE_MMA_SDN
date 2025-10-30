import { Injectable } from "@nestjs/common";
import { CreateVehicleStationDto } from "./dto/create-vehicle_station.dto";
import { UpdateVehicleStationDto } from "./dto/update-vehicle_station.dto";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { VehicleAtStation } from "src/models/vehicle_at_station.schema";
import mongoose, { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ResponseMsg } from "src/common/response/response-message";
import { ChangeStatusDto } from "./dto/changeStatus.dto";
import { Vehicle } from "src/models/vehicle.schema";
import { Station } from "src/models/station.schema";
import { applyCommonFiltersMongo } from "src/common/pagination/applyCommonFilters";
import { VehicleAtStationPaginationDto } from "src/common/pagination/dto/vehicle_at_station/vehicle_at_station-pagination";
import { ResponseList } from "src/common/response/response-list";

import { applySortingMongo } from "src/common/pagination/applySorting";
import { applyPaginationMongo } from "src/common/pagination/applyPagination";
import { applyFacetMongo } from "src/common/pagination/applyFacetMongo";
import { FacetResult, VehicleAtStationAggregateResult, VehicleAtStationResponse } from "src/common/utils/type";
import { buildPaginationResponse } from "src/common/pagination/pagination-response";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { Pricing } from "src/models/pricings.schema";
import { VehicleAtStationFieldMapping } from "src/common/pagination/filters/vehicle_at_station-field-mapping";

@Injectable()
export class VehicleStationService {
  constructor(
    @InjectModel(VehicleAtStation.name) private readonly vehicleStationRepository: Model<VehicleAtStation>,
    @InjectModel(Vehicle.name) private readonly vehicleRepository: Model<Vehicle>,
    @InjectModel(Station.name) private readonly stationRepository: Model<Station>,
    @InjectModel(Pricing.name) private readonly pricingRepository: Model<Pricing>,
  ) {}
  async create(createVehicleStationDto: CreateVehicleStationDto): Promise<ResponseDetail<VehicleAtStation>> {
    const newVehicleStation = new this.vehicleStationRepository(createVehicleStationDto);
    const savedVehicleStation = await newVehicleStation.save();
    return ResponseDetail.ok(savedVehicleStation);
  }

  private ReturnDataVehicleAtStationMapping(data: VehicleAtStationAggregateResult): VehicleAtStationResponse {
    return {
      _id: data._id,
      current_battery_capacity_kwh: data.current_battery_capacity_kwh,
      current_mileage: data.current_mileage,
      status: data.status,
      start_time: data.start_time,
      end_time: data.end_time,
      vehicle: data.vehicle
        ? {
            _id: data.vehicle._id,
            make: data.vehicle.make,
            model: data.vehicle.model,
            model_year: data.vehicle.model_year,
            category: data.vehicle.category,
            price_rental_per_day: data.vehicle.price_rental_per_day,
            fee_deposit: data.vehicle.fee_deposit,
            battery_capacity_kwh: data.vehicle.battery_capacity_kwh,
            range_km: data.vehicle.range_km,
            vin_number: data.vehicle.vin_number,
            is_active: data.vehicle.is_active,
          }
        : null,
      station: data.station
        ? {
            _id: data.station._id,
            name: data.station.name,
            address: data.station.address,
            latitude: data.station.latitude,
            longitude: data.station.longitude,
            is_active: data.station.is_active,
          }
        : null,
      pricing: data.pricing || null,
    };
  }
  async findAll(filters: VehicleAtStationPaginationDto): Promise<ResponseList<VehicleAtStationResponse>> {
    const pipeline: any[] = [];
    const currentDate = new Date();

    pipeline.push(
      {
        $lookup: {
          from: this.vehicleRepository.collection.name,
          localField: "vehicle_id",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      {
        $lookup: {
          from: this.stationRepository.collection.name,
          localField: "station_id",
          foreignField: "_id",
          as: "station",
        },
      },
      {
        $lookup: {
          from: this.pricingRepository.collection.name,
          localField: "vehicle_id",
          foreignField: "vehicle_id",
          as: "pricing",
        },
      },
      {
        $addFields: {
          vehicle: { $arrayElemAt: ["$vehicle", 0] },
          station: { $arrayElemAt: ["$station", 0] },
          pricing: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$pricing",
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
    );

    applyCommonFiltersMongo(pipeline, filters, VehicleAtStationFieldMapping);
    const allowedSortFields = ["vehicle.model_year", "vehicle.make", "vehicle.model", "station.name", "status", "created_at"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "created_at");
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);

    const result = (await this.vehicleStationRepository.aggregate(pipeline)) as FacetResult<VehicleAtStationAggregateResult>;
    const data = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;

    const mappedData = data.map((item) => this.ReturnDataVehicleAtStationMapping(item));

    return ResponseList.ok(buildPaginationResponse(mappedData, { total, page: filters.page, take: filters.take }));
  }

  async findOne(id: string): Promise<ResponseDetail<VehicleAtStationResponse>> {
    const objectId = new mongoose.Types.ObjectId(id);
    const currentDate = new Date();

    const pipeline: any[] = [];

    pipeline.push(
      {
        $match: { _id: objectId },
      },
      {
        $lookup: {
          from: this.vehicleRepository.collection.name,
          localField: "vehicle_id",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      {
        $lookup: {
          from: this.stationRepository.collection.name,
          localField: "station_id",
          foreignField: "_id",
          as: "station",
        },
      },
      {
        $lookup: {
          from: this.pricingRepository.collection.name,
          localField: "vehicle_id",
          foreignField: "vehicle_id",
          as: "pricing",
        },
      },
      {
        $addFields: {
          vehicle: { $arrayElemAt: ["$vehicle", 0] },
          station: { $arrayElemAt: ["$station", 0] },
          pricing: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$pricing",
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
    );

    const result = await this.vehicleStationRepository.aggregate(pipeline);
    const vehicleStation = result[0] as VehicleAtStationAggregateResult;

    if (!vehicleStation) {
      throw new NotFoundException("Vehicle at station not found");
    }

    const formattedData = this.ReturnDataVehicleAtStationMapping(vehicleStation);

    return ResponseDetail.ok(formattedData);
  }

  async update(id: string, updateVehicleStationDto: UpdateVehicleStationDto): Promise<ResponseDetail<VehicleAtStation>> {
    const updatedVehicleStation = await this.vehicleStationRepository.findByIdAndUpdate(id, updateVehicleStationDto, { new: true });
    if (!updatedVehicleStation) {
      throw new NotFoundException("Vehicle at station not found");
    }
    return ResponseDetail.ok(updatedVehicleStation);
  }
  async changeStatus(id: string, changeStatus: ChangeStatusDto): Promise<ResponseDetail<VehicleAtStation>> {
    const updatedVehicleStation = await this.vehicleStationRepository.findByIdAndUpdate(id, { status: changeStatus.status }, { new: true });
    if (!updatedVehicleStation) {
      throw new NotFoundException("Vehicle at station not found");
    }
    return ResponseDetail.ok(updatedVehicleStation);
  }

  async remove(id: string): Promise<ResponseMsg> {
    await this.vehicleStationRepository.findByIdAndDelete(id);
    return ResponseMsg.ok("Vehicle at station deleted successfully");
  }
}
