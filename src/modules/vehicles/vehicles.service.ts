import { Injectable } from "@nestjs/common";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Vehicle } from "src/models/vehicle.schema";
import mongoose, { Model } from "mongoose";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { FacetResult, VehicleAggregateResult } from "src/common/utils/type";
import { applyCommonFiltersMongo } from "src/common/pagination/applyCommonFilters";
import { applyFacetMongo } from "src/common/pagination/applyFacetMongo";
import { applyPaginationMongo } from "src/common/pagination/applyPagination";
import { applySortingMongo } from "src/common/pagination/applySorting";
import { VehiclePaginationDto } from "src/common/pagination/dto/vehicle/vehicle-pagination.dto";
import { VehicleFieldMapping } from "src/common/pagination/filters/vehicle-field-mapping";
import { ResponseList } from "src/common/response/response-list";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseMsg } from "src/common/response/response-message";
import { buildPaginationResponse } from "src/common/pagination/pagination-response";
// import { VehicleWithPricingAndStation } from "./dto/get-vehicle-respone.dto";
import { Station } from "src/models/station.schema";
import { ImagekitService } from "src/common/imagekit/imagekit.service";
import { ChangeStatusDto } from "../rentals/dto/changeStatus.dto";

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleRepository: Model<Vehicle>,
    @InjectModel(Station.name) private stationRepository: Model<Station>,

    private readonly imagekitService: ImagekitService,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, imageFile?: any): Promise<ResponseDetail<Vehicle>> {
    // check station
    if (!createVehicleDto.station_id) {
      throw new NotFoundException("Station ID is required");
    }
    const station = await this.stationRepository.findById(createVehicleDto.station_id);
    if (!station) {
      throw new NotFoundException("Station not found");
    }
    if (!station.is_active) {
      throw new NotFoundException("Station is inactive");
    }
    // check vin number unique
    if (createVehicleDto.vin_number) {
      const existingVehicle = await this.vehicleRepository.findOne({ vin_number: createVehicleDto.vin_number });
      if (existingVehicle) {
        throw new NotFoundException("VIN number already exists");
      }
    }

    // check license plate unique (required field)
    if (!createVehicleDto.license_plate) {
      throw new NotFoundException("License plate is required");
    }
    const existingLicensePlate = await this.vehicleRepository.findOne({ license_plate: createVehicleDto.license_plate.toUpperCase() });
    if (existingLicensePlate) {
      throw new NotFoundException("License plate already exists");
    }

    // Upload image to ImageKit if file is provided
    let imageUrl: string | undefined;
    let image_kit_file_id: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (imageFile?.buffer) {
      const fileName = createVehicleDto.label ? `${createVehicleDto.label}_${Date.now()}` : `vehicle_${Date.now()}`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const uploadResult = await this.imagekitService.uploadVehicleImage(imageFile.buffer, fileName);
      if (uploadResult.data) {
        imageUrl = uploadResult.data.url;
        image_kit_file_id = uploadResult.data.fileId;
      }
    }

    const newVehicle = new this.vehicleRepository({
      ...createVehicleDto,
      img_url: imageUrl,
      image_kit_file_id: image_kit_file_id,
    });
    const savedVehicle = await newVehicle.save();
    return ResponseDetail.ok(savedVehicle);
  }

  async findAll(filters: VehiclePaginationDto): Promise<ResponseList<VehicleAggregateResult>> {
    const pipeline: any[] = [];
    applyCommonFiltersMongo(pipeline, filters, VehicleFieldMapping);
    // Add lookup for station
    pipeline.push(
      {
        $lookup: {
          from: "stations",
          localField: "station_id",
          foreignField: "_id",
          as: "station",
        },
      },
      {
        $addFields: {
          station: { $arrayElemAt: ["$station", 0] },
        },
      },
    );

    // Add lookup for current pricing

    const allowedSortFields = ["model_year", "create_at", "status"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "create_at");
    pipeline.push({
      $project: {
        _id: 1,
        make: 1,
        model: 1,
        model_year: 1,
        category: 1,
        battery_capacity_kwh: 1,
        range_km: 1,
        vin_number: 1,
        license_plate: 1,
        img_url: 1,
        is_active: 1,
        current_battery_capacity_kwh: 1,
        current_mileage: 1,
        status: 1,
        price_per_hour: 1,
        price_per_day: 1,
        deposit_amount: 1,
        station: 1,
        created_at: 1,
      },
    });
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);
    const result = (await this.vehicleRepository.aggregate(pipeline)) as FacetResult<VehicleAggregateResult>;
    const vehicles = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;
    return ResponseList.ok<VehicleAggregateResult>(
      buildPaginationResponse(vehicles, {
        total,
        page: filters.page,
        take: filters.take,
      }),
    );
  }

  async findOne(id: string): Promise<ResponseDetail<VehicleAggregateResult>> {
    const pipeline: any[] = [];
    pipeline.push(
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      // Lookup station information
      {
        $lookup: {
          from: "stations",
          localField: "station_id",
          foreignField: "_id",
          as: "station",
        },
      },
      {
        $addFields: {
          station: { $arrayElemAt: ["$station", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          make: 1,
          model: 1,
          model_year: 1,
          category: 1,
          battery_capacity_kwh: 1,
          range_km: 1,
          vin_number: 1,
          img_url: 1,
          is_active: 1,
          current_battery_capacity_kwh: 1,
          current_mileage: 1,
          status: 1,
          price_per_hour: 1,
          price_per_day: 1,
          deposit_amount: 1,
          license_plate: 1,
          station: 1,
          created_at: 1,
        },
      },
    );
    const result = await this.vehicleRepository.aggregate(pipeline);
    const vehicle = result[0] as VehicleAggregateResult;
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    return ResponseDetail.ok(vehicle);
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, imageFile?: any): Promise<ResponseDetail<Vehicle>> {
    // Check if vehicle exists
    const existingVehicle = await this.vehicleRepository.findById(id);
    if (!existingVehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    // check station
    if (updateVehicleDto.station_id) {
      const station = await this.stationRepository.findById(updateVehicleDto.station_id);
      if (!station) {
        throw new NotFoundException("Station not found");
      }
      if (!station.is_active) {
        throw new NotFoundException("Station is inactive");
      }
    }

    // Upload new image to ImageKit if file is provided
    let imageUrl: string | undefined = existingVehicle.img_url;
    let imageKitFileId: string | undefined = existingVehicle.image_kit_file_id;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (imageFile?.buffer) {
      // Delete old image from ImageKit if exists
      if (existingVehicle.image_kit_file_id) {
        try {
          await this.imagekitService.deleteImage(existingVehicle.image_kit_file_id);
        } catch (error) {
          // Log error but continue with upload
          console.error("Failed to delete old image:", error);
        }
      }

      // Upload new image
      const fileName = updateVehicleDto.label ? `${updateVehicleDto.label}_${Date.now()}` : `vehicle_${Date.now()}`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const uploadResult = await this.imagekitService.uploadVehicleImage(imageFile.buffer, fileName);
      if (uploadResult.data) {
        imageUrl = uploadResult.data.url;
        imageKitFileId = uploadResult.data.fileId;
      }
    }

    const updatedVehicle = await this.vehicleRepository.findByIdAndUpdate(
      id,
      {
        ...updateVehicleDto,
        img_url: imageUrl,
        image_kit_file_id: imageKitFileId,
      },
      { new: true },
    );

    if (!updatedVehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    return ResponseDetail.ok(updatedVehicle);
  }
  async changeStatus(id: string, status: ChangeStatusDto): Promise<ResponseMsg> {
    // Check if vehicle exists
    const existingVehicle = await this.vehicleRepository.findById(id);
    if (!existingVehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    const updatedVehicle = await this.vehicleRepository.findByIdAndUpdate(
      id,
      {
        status: status,
      },
      { new: true },
    );

    if (!updatedVehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    return ResponseMsg.ok("Vehicle status updated successfully");
  }
  async restore(id: string): Promise<ResponseMsg> {
    await this.vehicleRepository.findByIdAndUpdate(id, { is_active: true }, { new: true });
    return ResponseMsg.ok("Vehicle restored successfully");
  }

  async softDelete(id: string): Promise<ResponseMsg> {
    await this.vehicleRepository.findByIdAndUpdate(id, { is_active: false }, { new: true });
    return ResponseMsg.ok("Vehicle soft-deleted successfully");
  }

  async hardDelete(id: string): Promise<ResponseMsg> {
    await this.vehicleRepository.findByIdAndDelete(id);
    return ResponseMsg.ok("Vehicle hard-deleted successfully");
  }

  // async createWithStationAndPricing(createDto: CreateVehicleWithStationAndPricingDto): Promise<ResponseDetail<VehicleWithPricingAndStation>> {
  //   // Step 1: Verify the station exists
  //   const stationResponse = await this.stationService.findOne(createDto.station_id);
  //   if (!stationResponse.data) {
  //     throw new NotFoundException("Station not found");
  //   }

  //   // Step 2: Create the vehicle with the station_id
  //   const stationId = new mongoose.Types.ObjectId(createDto.station_id);
  //   const vehicleData = {
  //     ...createDto.vehicle,
  //     station_id: stationId,
  //   };
  //   const newVehicle = new this.vehicleRepository(vehicleData);
  //   const savedVehicle = await newVehicle.save();

  //   // Step 3: Create the pricing with the vehicle_id
  //   const pricingData = {
  //     ...createDto.pricing,
  //     vehicle_id: savedVehicle._id.toString(),
  //   };
  //   await this.pricingService.create(pricingData);

  //   // Step 4: Fetch the complete vehicle with station and pricing
  //   const vehicleWithDetails = await this.findOneWithPricingAndStation(savedVehicle._id.toString());

  //   if (!vehicleWithDetails) {
  //     throw new NotFoundException("Failed to retrieve created vehicle with details");
  //   }

  //   return ResponseDetail.ok(vehicleWithDetails);
  // }
  // async findOneWithPricingAndStation(id: string): Promise<VehicleWithPricingAndStation | null> {
  //   const currentDate = new Date();
  //   const pipeline: any[] = [
  //     {
  //       $match: {
  //         _id: new mongoose.Types.ObjectId(id),
  //       },
  //     },
  //     // Lookup station information
  //     {
  //       $lookup: {
  //         from: "stations",
  //         localField: "station_id",
  //         foreignField: "_id",
  //         as: "station",
  //       },
  //     },
  //     {
  //       $addFields: {
  //         station: { $arrayElemAt: ["$station", 0] },
  //       },
  //     },
  //     // Lookup current pricing
  //     {
  //       $lookup: {
  //         from: "pricings",
  //         localField: "_id",
  //         foreignField: "vehicle_id",
  //         as: "pricing_all",
  //       },
  //     },
  //     {
  //       $addFields: {
  //         pricing: {
  //           $arrayElemAt: [
  //             {
  //               $filter: {
  //                 input: {
  //                   $sortArray: {
  //                     input: "$pricing_all",
  //                     sortBy: { effective_from: -1 },
  //                   },
  //                 },
  //                 as: "price",
  //                 cond: {
  //                   $and: [
  //                     { $lte: ["$$price.effective_from", currentDate] },
  //                     {
  //                       $or: [{ $eq: ["$$price.effective_to", null] }, { $gte: ["$$price.effective_to", currentDate] }],
  //                     },
  //                   ],
  //                 },
  //               },
  //             },
  //             0,
  //           ],
  //         },
  //       },
  //     },
  //     {
  //       $project: { pricing_all: 0 },
  //     },
  //   ];
  //   const result = await this.vehicleRepository.aggregate(pipeline);
  //   return (result[0] as VehicleWithPricingAndStation) || null;
  // }

  async updateVehicleStatus(id: string, updateData: Partial<Vehicle>): Promise<Vehicle | null> {
    const updatedVehicle = await this.vehicleRepository.findByIdAndUpdate(id, updateData, { new: true });
    return updatedVehicle;
  }
}
