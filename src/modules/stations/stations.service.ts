import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types, isValidObjectId } from "mongoose";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { ConflictException } from "src/common/exceptions/conflict.exception";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { buildPaginationMeta, normalizePagination, PaginatedResult } from "src/common/utils/pagination";
import { MessageResponseDto } from "src/modules/auth/dto/message-response.dto";
import { CreateStationDto } from "./dto/create-station.dto";
import { UpdateStationDto } from "./dto/update-station.dto";
import { Station, StationDocument } from "src/models/station.schema";

type StationLean = Station & {
  _id: Types.ObjectId | string;
  station_id: Types.ObjectId | string;
  created_at?: Date;
  __v?: number;
};

type StationPlain = Omit<StationLean, "__v" | "station_id" | "_id"> & {
  _id: string;
  station_id: string;
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
export class StationsService {
  constructor(
    @InjectModel(Station.name)
    private readonly stationModel: Model<StationDocument>,
  ) {}

  async create(createStationDto: CreateStationDto): Promise<StationPlain> {
    try {
      const createdStation = await this.stationModel.create(createStationDto);
      return this.normalizeStation(createdStation.toObject() as StationLean);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException("Station already exists");
      }
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<StationPlain>> {
    const pagination = normalizePagination(paginationDto);

    const [stations, total] = await Promise.all([
      this.stationModel
        .find()
        .sort({ created_at: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .select("-__v")
        .lean<StationLean[]>(),
      this.stationModel.countDocuments(),
    ]);

    return {
      data: stations.map((station) => this.normalizeStation(station)),
      meta: buildPaginationMeta(total, pagination),
    };
  }

  async findOne(id: string): Promise<StationPlain> {
    this.ensureValidObjectId(id);
    const station = await this.stationModel.findById(id).select("-__v").lean<StationLean | null>();
    if (!station) {
      throw new NotFoundException("Station not found");
    }
    return this.normalizeStation(station);
  }

  async update(id: string, updateStationDto: UpdateStationDto): Promise<StationPlain> {
    this.ensureValidObjectId(id);
    try {
      const station = await this.stationModel
        .findByIdAndUpdate(id, updateStationDto, { new: true, runValidators: true })
        .select("-__v")
        .lean<StationLean | null>();
      if (!station) {
        throw new NotFoundException("Station not found");
      }
      return this.normalizeStation(station);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException("Station already exists");
      }
      throw error;
    }
  }

  async remove(id: string): Promise<MessageResponseDto> {
    this.ensureValidObjectId(id);
    const station = await this.stationModel.findByIdAndDelete(id);
    if (!station) {
      throw new NotFoundException("Station not found");
    }
    return { msg: "Station deleted successfully" };
  }

  private ensureValidObjectId(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException("Station not found");
    }
  }

  private normalizeStation(station: StationLean): StationPlain {
    const { _id, station_id, ...rest } = station;
    const stationWithoutVersion = { ...rest } as Record<string, unknown>;
    delete stationWithoutVersion.__v;

    return {
      ...(stationWithoutVersion as Omit<StationPlain, "_id" | "station_id">),
      _id: this.stringifyId(_id),
      station_id: this.stringifyId(station_id),
    };
  }

  private stringifyId(value: Types.ObjectId | string): string {
    return typeof value === "string" ? value : value.toHexString();
  }
}
