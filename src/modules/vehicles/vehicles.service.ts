import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types, isValidObjectId } from "mongoose";
import { ConflictException } from "src/common/exceptions/conflict.exception";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { buildPaginationMeta, normalizePagination, PaginatedResult } from "src/common/utils/pagination";
import { MessageResponseDto } from "src/modules/auth/dto/message-response.dto";
import { Vehicle, VehicleDocument } from "src/models/vehicle.schema";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { QueryVehicleDto } from "./dto/query-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

type VehicleLean = Vehicle & {
  _id: Types.ObjectId | string;
  vehicle_id: Types.ObjectId | string;
  created_at: Date;
  __v?: number;
};

type VehiclePlain = Omit<VehicleLean, "__v" | "vehicle_id" | "_id"> & {
  _id: string;
  vehicle_id: string;
};

const DUPLICATE_ERROR_CODE = 11000;

const isDuplicateKeyError = (error: unknown): error is { code: number } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "number" &&
    (error as { code: number }).code === DUPLICATE_ERROR_CODE
  );
};

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<VehicleDocument>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<VehiclePlain> {
    try {
      const vehicle = await this.vehicleModel.create(createVehicleDto);
      return this.normalizeVehicle(vehicle.toObject() as VehicleLean);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException("Vehicle already exists");
      }
      throw error;
    }
  }

  async findAll(query: QueryVehicleDto): Promise<PaginatedResult<VehiclePlain>> {
    const filters = this.buildFilters(query);
    const pagination = normalizePagination(query);

    const [vehicles, total] = await Promise.all([
      this.vehicleModel
        .find(filters)
        .sort({ created_at: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .select("-__v")
        .lean<VehicleLean[]>(),
      this.vehicleModel.countDocuments(filters),
    ]);

    return {
      data: vehicles.map((vehicle) => this.normalizeVehicle(vehicle)),
      meta: buildPaginationMeta(total, pagination),
    };
  }

  async findOne(id: string): Promise<VehiclePlain> {
    this.ensureValidObjectId(id);
    const vehicle = await this.vehicleModel.findById(id).select("-__v").lean<VehicleLean | null>();
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    return this.normalizeVehicle(vehicle);
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<VehiclePlain> {
    this.ensureValidObjectId(id);
    try {
      const vehicle = await this.vehicleModel
        .findByIdAndUpdate(id, updateVehicleDto, { new: true, runValidators: true })
        .select("-__v")
        .lean<VehicleLean | null>();
      if (!vehicle) {
        throw new NotFoundException("Vehicle not found");
      }
      return this.normalizeVehicle(vehicle);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException("Vehicle already exists");
      }
      throw error;
    }
  }

  async remove(id: string): Promise<MessageResponseDto> {
    this.ensureValidObjectId(id);
    const vehicle = await this.vehicleModel.findByIdAndDelete(id);
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    return { msg: "Vehicle deleted successfully" };
  }

  private buildFilters(query: QueryVehicleDto): FilterQuery<VehicleDocument> {
    const filters: FilterQuery<VehicleDocument> = {};

    if (query.q) {
      const regex = new RegExp(this.escapeRegex(query.q), "i");
      filters.$or = [
        { make: regex },
        { model: regex },
        { vin_number: regex },
      ];
    }

    if (query.category) {
      filters.category = new RegExp(`^${this.escapeRegex(query.category)}$`, "i");
    }

    if (typeof query.model_year === "number") {
      filters.model_year = query.model_year;
    }

    if (typeof query.min_battery_kwh === "number") {
      filters.battery_capacity_kwh = { $gte: query.min_battery_kwh };
    }

    if (typeof query.min_range_km === "number") {
      filters.range_km = { $gte: query.min_range_km };
    }

    return filters;
  }

  private ensureValidObjectId(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException("Vehicle not found");
    }
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private normalizeVehicle(vehicle: VehicleLean): VehiclePlain {
    const { _id, vehicle_id, ...rest } = vehicle;
    const vehicleWithoutVersion = { ...rest } as Record<string, unknown>;
    delete vehicleWithoutVersion.__v;

    return {
      ...(vehicleWithoutVersion as Omit<VehiclePlain, "_id" | "vehicle_id">),
      _id: this.stringifyId(_id),
      vehicle_id: this.stringifyId(vehicle_id),
    };
  }

  private stringifyId(value: Types.ObjectId | string): string {
    return typeof value === "string" ? value : value.toHexString();
  }
}
