import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Vehicle } from 'src/models/vehicle.schema';
import { Model } from 'mongoose';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { buildPaginationResponse } from 'src/common/pagination/pagination-response';

import { FacetResult } from 'src/common/utils/type';
import { applyCommonFiltersMongo } from 'src/common/pagination/applyCommonFilters';
import { applyFacetMongo } from 'src/common/pagination/applyFacetMongo';
import { applyPaginationMongo } from 'src/common/pagination/applyPagination';
import { applySortingMongo } from 'src/common/pagination/applySorting';

import { VehiclePaginationDto } from 'src/common/pagination/dto/vehicle/vehicle-pagination.dto';
import { VehicleFieldMapping } from 'src/common/pagination/filters/vehicle-field-mapping';

@Injectable()
export class VehicleService {
  constructor(@InjectModel(Vehicle.name) private vehicleRepository: Model<Vehicle>) {}
  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const newVehicle = new this.vehicleRepository(createVehicleDto);
    return await newVehicle.save();
  }
  async findAll(filters: VehiclePaginationDto): Promise<ReturnType<typeof buildPaginationResponse>> {
    const pipeline: any[] = [];
    applyCommonFiltersMongo(pipeline, filters, VehicleFieldMapping);
    const allowedSortFields = ['model_year', 'create_at'];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, 'create_at');
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);
    const result = (await this.vehicleRepository.aggregate(pipeline)) as FacetResult<Vehicle>;
    const vehicles = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;
    return buildPaginationResponse(vehicles, {
      page: filters.page,
      take: filters.take,
      total,
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }
  async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const updatedVehicle = await this.vehicleRepository.findByIdAndUpdate(id, updateVehicleDto, { new: true });
    if (!updatedVehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return updatedVehicle;
  }
  async softDelete(id: string): Promise<{ msg: string }> {
    await this.vehicleRepository.findByIdAndUpdate(id, { is_active: false }, { new: true });
    return {
      msg: 'Vehicle soft-deleted successfully',
    };
  }
  async hashDelete(id: string): Promise<{ msg: string }> {
    await this.vehicleRepository.findByIdAndDelete(id);
    return {
      msg: 'Vehicle hard-deleted successfully',
    };
  }
}
