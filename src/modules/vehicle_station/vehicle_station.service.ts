import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateVehicleStationDto } from "./dto/create-vehicle_station.dto";
import { UpdateVehicleStationDto } from "./dto/update-vehicle_station.dto";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { VehicleAtStation } from "src/models/vehicle_at_station.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ResponseMsg } from "src/common/response/response-message";
import { ChangeStatusDto } from "./dto/changeStatus.dto";
import { Vehicle } from "src/models/vehicle.schema";
import { Station } from "src/models/station.schema";
import { applyCommonFiltersMongo } from "src/common/pagination/applyCommonFilters";
import { VehicleAtStationPaginationDto } from "src/common/pagination/dto/vehicle_at_station/vehicle_at_station-pagination";
import { ResponseList } from "src/common/response/response-list";
import { VehicleAtStationFieldMapping } from "src/common/pagination/filters/vehicle_at_station-filed-mapping";
import { applySortingMongo } from "src/common/pagination/applySorting";
import { applyPaginationMongo } from "src/common/pagination/applyPagination";
import { applyFacetMongo } from "src/common/pagination/applyFacetMongo";
import { FacetResult } from "src/common/utils/type";
import { buildPaginationResponse } from "src/common/pagination/pagination-response";

@Injectable()
export class VehicleStationService {
  constructor(
    @InjectModel(VehicleAtStation.name) private readonly vehicleStationRepository: Model<VehicleAtStation>,
    @InjectModel(Vehicle.name) private readonly vehicleRepository: Model<Vehicle>,
    @InjectModel(Station.name) private readonly stationRepository: Model<Station>,
  ) {}
  async create(createVehicleStationDto: CreateVehicleStationDto): Promise<ResponseDetail<VehicleAtStation>> {
    const newVehicleStation = new this.vehicleStationRepository(createVehicleStationDto);
    const savedVehicleStation = await newVehicleStation.save();
    return ResponseDetail.ok(savedVehicleStation);
  }

  async findAll(filters: VehicleAtStationPaginationDto): Promise<ResponseList<VehicleAtStation>> {
    const pipeline: any[] = [];

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
      { $unwind: { path: "$station", preserveNullAndEmptyArrays: true } },
    );
    applyCommonFiltersMongo(pipeline, filters, VehicleAtStationFieldMapping);
    const allowedSortFields = ["model_year", "make", "model", "station.name", "status", "created_at"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "created_at");
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);
    const result = (await this.vehicleStationRepository.aggregate(pipeline)) as FacetResult<VehicleAtStation>;
    const data = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;
    return ResponseList.ok(buildPaginationResponse(data, { total, page: filters.page, take: filters.take }));
  }

  async findOne(id: string): Promise<ResponseDetail<VehicleAtStation | null>> {
    const vehicleStation = await this.vehicleStationRepository.findById(id).exec();
    if (!vehicleStation) {
      throw new NotFoundException("Vehicle at station not found");
    }
    return ResponseDetail.ok(vehicleStation);
  }

  async update(id: string, updateVehicleStationDto: UpdateVehicleStationDto): Promise<ResponseDetail<VehicleAtStation | null>> {
    const updatedVehicleStation = await this.vehicleStationRepository.findByIdAndUpdate(id, updateVehicleStationDto, { new: true });
    if (!updatedVehicleStation) {
      throw new NotFoundException("Vehicle at station not found");
    }
    return ResponseDetail.ok(updatedVehicleStation);
  }
  async changeStatus(id: string, changeStatus: ChangeStatusDto): Promise<ResponseDetail<VehicleAtStation | null>> {
    const updatedVehicleStation = await this.vehicleStationRepository.findByIdAndUpdate(id, { status: changeStatus.status }, { new: true });
    if (!updatedVehicleStation) {
      throw new NotFoundException("Vehicle at station not found");
    }
    return ResponseDetail.ok(updatedVehicleStation);
  }

  async remove(id: number): Promise<ResponseMsg> {
    await this.vehicleStationRepository.findByIdAndDelete(id);
    return ResponseMsg.ok("Vehicle at station deleted successfully");
  }
  private VehicleAtStationMapping() {
    return;
  }
}
