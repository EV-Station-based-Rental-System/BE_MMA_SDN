import { Injectable } from "@nestjs/common";
import { CreateStaffAtStationDto } from "./dto/create-staff_at_station.dto";
import { UpdateStaffAtStationDto } from "./dto/update-staff_at_station.dto";
import { InjectModel } from "@nestjs/mongoose";
import { StaffAtStation } from "src/models/staff_at_station.schema";
import { Model } from "mongoose";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { Staff } from "src/models/staff.schema";
import { Station } from "src/models/station.schema";
import { ResponseMsg } from "src/common/response/response-message";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { StaffAtStationPaginationDto } from "src/common/pagination/dto/staff_at_station/staff_at_station-pagination";
import { ResponseList } from "src/common/response/response-list";
import { User } from "src/models/user.schema";
import { applyCommonFiltersMongo } from "src/common/pagination/applyCommonFilters";
import { StaffAtStationFieldMapping } from "src/common/pagination/filters/staff_at_station-field-mapping";
import { applySortingMongo } from "src/common/pagination/applySorting";
import { applyPaginationMongo } from "src/common/pagination/applyPagination";
import { applyFacetMongo } from "src/common/pagination/applyFacetMongo";
import { FacetResult } from "src/common/utils/type";
import { buildPaginationResponse } from "src/common/pagination/pagination-response";
import { ChangeRoleDto } from "./dto/changeRole.dto";

@Injectable()
export class StaffAtStationService {
  constructor(
    @InjectModel(StaffAtStation.name) private readonly staffAtStationModel: Model<StaffAtStation>,
    @InjectModel(Staff.name) private readonly staffRepository: Model<Staff>,
    @InjectModel(Station.name) private readonly stationRepository: Model<Station>,
    @InjectModel(User.name) private readonly userRepository: Model<User>,
  ) { }

  async create(createStaffAtStationDto: CreateStaffAtStationDto): Promise<ResponseDetail<StaffAtStation>> {
    const newStaffAtStation = new this.staffAtStationModel(createStaffAtStationDto);
    const savedStaffAtStation = await newStaffAtStation.save();
    return ResponseDetail.ok(savedStaffAtStation);
  }

  async findAll(filters: StaffAtStationPaginationDto): Promise<ResponseList<StaffAtStation>> {
    const pipeline: any[] = [

      {
        $lookup: {
          from: this.staffRepository.collection.name,
          localField: "staff_id",
          foreignField: "_id",
          as: "staff",
        },
      },
      { $unwind: { path: "$staff", preserveNullAndEmptyArrays: true } },


      {
        $lookup: {
          from: this.userRepository.collection.name,
          let: { userId: "$staff.user_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          ],
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },


      {
        $lookup: {
          from: this.stationRepository.collection.name,
          localField: "station_id",
          foreignField: "_id",
          as: "station",
        },
      },
      { $unwind: { path: "$station", preserveNullAndEmptyArrays: true } },
    ];
    applyCommonFiltersMongo(pipeline, filters, StaffAtStationFieldMapping);
    const allowedSortFields = ['created_at', 'staff.full_name', 'station.name'];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, 'created_at');
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);
    const result = (await this.staffAtStationModel.aggregate(pipeline)) as FacetResult<StaffAtStation>;
    const data = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;
    return ResponseList.ok(buildPaginationResponse(data, { total, page: filters.page, take: filters.take }));

  }

  async findOne(id: string): Promise<ResponseDetail<StaffAtStation>> {
    const staffAtStation = await this.staffAtStationModel.findById(id);
    if (!staffAtStation) {
      throw new NotFoundException("Staff at station not found");
    }
    return ResponseDetail.ok(staffAtStation);
  }

  async update(id: string, updateStaffAtStationDto: UpdateStaffAtStationDto): Promise<ResponseDetail<StaffAtStation>> {
    const updatedStaffAtStation = await this.staffAtStationModel.findByIdAndUpdate(id, updateStaffAtStationDto, { new: true });
    if (!updatedStaffAtStation) {
      throw new NotFoundException("Staff at station not found");
    }
    return ResponseDetail.ok(updatedStaffAtStation);
  }

  async updateRoleAtStation(id: string, body: ChangeRoleDto): Promise<ResponseMsg> {
    const updatedStaffAtStation = await this.staffAtStationModel.findByIdAndUpdate(id, { role_at_station: body.role_at_station }, { new: true });
    if (!updatedStaffAtStation) {
      throw new NotFoundException("Staff at station not found");
    }
    return ResponseMsg.ok("Staff at station role updated successfully");
  }

  async remove(id: string): Promise<ResponseMsg> {
    await this.staffAtStationModel.findByIdAndDelete(id);
    return ResponseMsg.ok("Staff at station removed successfully");
  }
}
