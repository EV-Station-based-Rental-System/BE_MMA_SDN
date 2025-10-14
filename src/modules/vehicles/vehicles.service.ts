import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Vehicle } from 'src/models/vehicle.schema';
import { Model } from 'mongoose';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { FacetResult } from 'src/common/utils/type';
import { applyCommonFiltersMongo } from 'src/common/pagination/applyCommonFilters';
import { applyFacetMongo } from 'src/common/pagination/applyFacetMongo';
import { applyPaginationMongo } from 'src/common/pagination/applyPagination';
import { applySortingMongo } from 'src/common/pagination/applySorting';
import { VehiclePaginationDto } from 'src/common/pagination/dto/vehicle/vehicle-pagination.dto';
import { VehicleFieldMapping } from 'src/common/pagination/filters/vehicle-field-mapping';
import { ResponseList } from 'src/common/response/response-list';
import { ResponseDetail } from 'src/common/response/response-detail-create-update';
import { ResponseMsg } from 'src/common/response/response-message';
import { buildPaginationResponse } from 'src/common/pagination/pagination-response';

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
    const allowedSortFields = ['model_year', 'create_at'];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, 'create_at');
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
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return ResponseDetail.ok(vehicle);
  }
  async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<ResponseDetail<Vehicle>> {
    const updatedVehicle = await this.vehicleRepository.findByIdAndUpdate(id, updateVehicleDto, { new: true });
    if (!updatedVehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return ResponseDetail.ok(updatedVehicle);
  }
  async softDelete(id: string): Promise<ResponseMsg> {
    await this.vehicleRepository.findByIdAndUpdate(id, { is_active: false }, { new: true });
    return ResponseMsg.ok('Vehicle soft-deleted successfully');
  }
  async hashDelete(id: string): Promise<ResponseMsg> {
    await this.vehicleRepository.findByIdAndDelete(id);
    return ResponseMsg.ok('Vehicle hard-deleted successfully');
  }
}
