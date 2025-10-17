import { Injectable } from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Station } from "src/models/station.schema";
import { CreateStationDto } from "./dto/create-station.dto";
import { UpdateStationDto } from "./dto/update-station.dto";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { buildPaginationResponse } from "src/common/pagination/pagination-response";
import { StationPaginationDto } from "src/common/pagination/dto/station/station-pagination.dto";
import { applyCommonFiltersMongo } from "src/common/pagination/applyCommonFilters";
import { applyFacetMongo } from "src/common/pagination/applyFacetMongo";
import { applyPaginationMongo } from "src/common/pagination/applyPagination";
import { applySortingMongo } from "src/common/pagination/applySorting";

import { FacetResult } from "src/common/utils/type";
import { StationFieldMapping } from "src/common/pagination/filters/station-filed-mapping";
import { ResponseList } from "src/common/response/response-list";
import { ResponseDetail } from "src/common/response/response-detail-create-update";

@Injectable()
export class StationService {
  constructor(@InjectModel(Station.name) private stationRepository: Model<Station>) {}
  async create(createStationDto: CreateStationDto): Promise<Station> {
    const createdStation = new this.stationRepository(createStationDto);
    return await createdStation.save();
  }

  async findAll(filters: StationPaginationDto): Promise<ResponseList<Station>> {
    const pipeline: any[] = [];
    applyCommonFiltersMongo(pipeline, filters, StationFieldMapping);
    const allowedSortFields = ["name", "create_at"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "create_at");
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);
    const result = (await this.stationRepository.aggregate(pipeline)) as FacetResult<Station>;
    const stations = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;
    return ResponseList.ok(buildPaginationResponse(stations, { total, page: filters.page, take: filters.take }));
  }

  async findOne(id: string): Promise<ResponseDetail<Station>> {
    const station = await this.stationRepository.findById(id);
    if (!station) {
      throw new NotFoundException("Station not found");
    }
    return ResponseDetail.ok(station);
  }

  async update(id: string, updateStationDto: UpdateStationDto): Promise<ResponseDetail<Station | null>> {
    const updatedStation = await this.stationRepository.findByIdAndUpdate(id, updateStationDto, { new: true });
    if (!updatedStation) {
      throw new NotFoundException("Station not found");
    }
    return ResponseDetail.ok(updatedStation);
  }

  async softDelete(id: string): Promise<{ msg: string }> {
    await this.stationRepository.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    return { msg: "Station soft deleted successfully" };
  }

  async hardDelete(id: string): Promise<{ msg: string }> {
    await this.stationRepository.findByIdAndDelete(id);
    return { msg: "Station hard deleted successfully" };
  }
}
