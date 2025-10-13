import { Injectable } from "@nestjs/common";
// import { CreateStaffAtStationDto } from "./dto/create-staff_at_station.dto";
// import { UpdateStaffAtStationDto } from "./dto/update-staff_at_station.dto";
import { InjectModel } from "@nestjs/mongoose";
import { StaffAtStation } from "src/models/staff_at_station.schema";
import { Model } from "mongoose";

@Injectable()
export class StaffAtStationService {
  @InjectModel(StaffAtStation.name) private readonly staffAtStationModel: Model<StaffAtStation>;

  // create(createStaffAtStationDto: CreateStaffAtStationDto) {
  //   return "This action adds a new staffAtStation";
  // }

  // findAll() {
  //   return `This action returns all staffAtStation`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} staffAtStation`;
  // }

  // update(id: number, updateStaffAtStationDto: UpdateStaffAtStationDto) {
  //   return `This action updates a #${id} staffAtStation`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} staffAtStation`;
  // }
}
