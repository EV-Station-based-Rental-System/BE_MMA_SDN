import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateVehicleStationDto } from "./dto/create-vehicle_station.dto";
import { UpdateVehicleStationDto } from "./dto/update-vehicle_station.dto";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { VehicleAtStation } from "src/models/vehicle_at_station.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ResponseMsg } from "src/common/response/response-message";
import { ChangeStatusDto } from "./dto/changeStatus.dto";

@Injectable()
export class VehicleStationService {
  constructor(@InjectModel(VehicleAtStation.name) private readonly vehicleStationRepository: Model<VehicleAtStation>) {}
  async create(createVehicleStationDto: CreateVehicleStationDto): Promise<ResponseDetail<VehicleAtStation>> {
    const newVehicleStation = new this.vehicleStationRepository(createVehicleStationDto);
    const savedVehicleStation = await newVehicleStation.save();
    return ResponseDetail.ok(savedVehicleStation);
  }

  async findAll(): Promise<ResponseDetail<VehicleAtStation[]>> {
    const vehicleStations = await this.vehicleStationRepository.find().exec();
    return ResponseDetail.ok(vehicleStations);
  }

  async findOne(id: string): Promise<ResponseDetail<VehicleAtStation | null>> {
    const vehicleStation = await this.vehicleStationRepository.findById(id).exec();
    if (!vehicleStation) {
      throw new NotFoundException("Vehicle at station not found");
    }
    return ResponseDetail.ok(vehicleStation);
  }

  async update(id: string, updateVehicleStationDto: UpdateVehicleStationDto): Promise<ResponseDetail<VehicleAtStation | null>> {
    const updatedVehicleStation = await this.vehicleStationRepository.findByIdAndUpdate(id, updateVehicleStationDto, { new: true }).exec();
    if (!updatedVehicleStation) {
      throw new NotFoundException("Vehicle at station not found");
    }
    return ResponseDetail.ok(updatedVehicleStation);
  }
  async changeStatus(id: string, changeStatus: ChangeStatusDto): Promise<ResponseDetail<VehicleAtStation | null>> {
    const updatedVehicleStation = await this.vehicleStationRepository.findByIdAndUpdate(id, { status: changeStatus.status }, { new: true }).exec();
    if (!updatedVehicleStation) {
      throw new NotFoundException("Vehicle at station not found");
    }
    return ResponseDetail.ok(updatedVehicleStation);
  }

  async remove(id: number): Promise<ResponseMsg> {
    await this.vehicleStationRepository.findByIdAndDelete(id);
    return ResponseMsg.ok("Vehicle at station deleted successfully");
  }
}
