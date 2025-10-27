import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Rental, RentalDocument } from "src/models/rental.schema";
import { Booking, BookingDocument } from "src/models/booking.schema";
import { Vehicle, VehicleDocument } from "src/models/vehicle.schema";
import { CreateRentalDto } from "./dto/create-rental.dto";
import { UpdateRentalDto } from "./dto/update-rental.dto";
import { RentalPaginationDto } from "src/common/pagination/dto/rental/rental-pagination.dto";
import { RentalFieldMapping } from "src/common/pagination/filters/rental-field-mapping";
import { applyCommonFiltersMongo } from "src/common/pagination/applyCommonFilters";
import { applySortingMongo } from "src/common/pagination/applySorting";
import { applyPaginationMongo } from "src/common/pagination/applyPagination";
import { applyFacetMongo } from "src/common/pagination/applyFacetMongo";
import { FacetResult } from "src/common/utils/type";
import { buildPaginationResponse } from "src/common/pagination/pagination-response";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseList } from "src/common/response/response-list";
import { ResponseMsg } from "src/common/response/response-message";

@Injectable()
export class RentalsService {
  constructor(
    @InjectModel(Rental.name) private readonly rentalRepository: Model<RentalDocument>,
    @InjectModel(Booking.name) private readonly bookingRepository: Model<BookingDocument>,
    @InjectModel(Vehicle.name) private readonly vehicleRepository: Model<VehicleDocument>,
  ) {}

  async create(createRentalDto: CreateRentalDto): Promise<ResponseDetail<Rental>> {
    const bookingId = new Types.ObjectId(createRentalDto.booking_id);
    const vehicleId = new Types.ObjectId(createRentalDto.vehicle_id);

    await this.ensureBookingExists(bookingId);
    await this.ensureVehicleExists(vehicleId);

    const alreadyExists = await this.rentalRepository.exists({ booking_id: bookingId });
    if (alreadyExists) {
      throw new ConflictException("Rental already exists for booking");
    }

    const rental = await this.rentalRepository.create({
      ...createRentalDto,
      booking_id: bookingId,
      vehicle_id: vehicleId,
      pickup_datetime: new Date(createRentalDto.pickup_datetime),
      expected_return_datetime: createRentalDto.expected_return_datetime ? new Date(createRentalDto.expected_return_datetime) : undefined,
      actual_return_datetime: createRentalDto.actual_return_datetime ? new Date(createRentalDto.actual_return_datetime) : undefined,
      rated_at: createRentalDto.rated_at ? new Date(createRentalDto.rated_at) : undefined,
    });

    return ResponseDetail.ok(rental);
  }

  async findAll(filters: RentalPaginationDto): Promise<ResponseList<Rental>> {
    const pipeline: any[] = [];
    const matchStage: { created_at?: { $gte?: Date; $lte?: Date } } & Record<string, unknown> = {};

    if (filters.booking_id) {
      matchStage.booking_id = new Types.ObjectId(filters.booking_id);
    }
    if (filters.vehicle_id) {
      matchStage.vehicle_id = new Types.ObjectId(filters.vehicle_id);
    }
    if (filters.created_from || filters.created_to) {
      matchStage.created_at = {} as { $gte?: Date; $lte?: Date };
      if (filters.created_from) matchStage.created_at.$gte = new Date(filters.created_from);
      if (filters.created_to) matchStage.created_at.$lte = new Date(filters.created_to);
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    applyCommonFiltersMongo(pipeline, filters, RentalFieldMapping);
    const allowedSortFields = ["created_at", "status", "pickup_datetime"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "created_at");
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);

    const result = (await this.rentalRepository.aggregate(pipeline)) as FacetResult<Rental>;
    const rentals = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;

    return ResponseList.ok(buildPaginationResponse(rentals, { total, page: filters.page, take: filters.take }));
  }

  async findMine(userId: string, filters: RentalPaginationDto): Promise<ResponseList<Rental>> {
    const pipeline: any[] = [
      {
        $lookup: {
          from: this.bookingRepository.collection.name,
          localField: "booking_id",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      { $match: { "booking.renter_id": new Types.ObjectId(userId) } },
    ];

    const matchStage: { created_at?: { $gte?: Date; $lte?: Date } } & Record<string, unknown> = {};

    if (filters.booking_id) {
      matchStage.booking_id = new Types.ObjectId(filters.booking_id);
    }
    if (filters.vehicle_id) {
      matchStage.vehicle_id = new Types.ObjectId(filters.vehicle_id);
    }
    if (filters.created_from || filters.created_to) {
      matchStage.created_at = {} as { $gte?: Date; $lte?: Date };
      if (filters.created_from) matchStage.created_at.$gte = new Date(filters.created_from);
      if (filters.created_to) matchStage.created_at.$lte = new Date(filters.created_to);
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    applyCommonFiltersMongo(pipeline, filters, RentalFieldMapping);
    pipeline.push({ $project: { booking: 0 } });

    const allowedSortFields = ["created_at", "status", "pickup_datetime"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "created_at");
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);

    const result = (await this.rentalRepository.aggregate(pipeline)) as FacetResult<Rental>;
    const rentals = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;

    return ResponseList.ok(buildPaginationResponse(rentals, { total, page: filters.page, take: filters.take }));
  }

  async findOne(id: string): Promise<ResponseDetail<Rental>> {
    const rental = await this.rentalRepository.findById(id);
    if (!rental) {
      throw new NotFoundException("Rental not found");
    }
    return ResponseDetail.ok(rental);
  }

  async update(id: string, updateRentalDto: UpdateRentalDto): Promise<ResponseDetail<Rental>> {
    const updatePayload: Record<string, any> = { ...updateRentalDto };

    if (updateRentalDto.booking_id) {
      const bookingId = new Types.ObjectId(updateRentalDto.booking_id);
      await this.ensureBookingExists(bookingId);
      const existingRental = await this.rentalRepository.exists({ booking_id: bookingId, _id: { $ne: id } });
      if (existingRental) {
        throw new ConflictException("Rental already exists for booking");
      }
      updatePayload.booking_id = bookingId;
    }

    if (updateRentalDto.vehicle_id) {
      const vehicleId = new Types.ObjectId(updateRentalDto.vehicle_id);
      await this.ensureVehicleExists(vehicleId);
      updatePayload.vehicle_id = vehicleId;
    }

    if (updateRentalDto.pickup_datetime) {
      updatePayload.pickup_datetime = new Date(updateRentalDto.pickup_datetime);
    }
    if (updateRentalDto.expected_return_datetime) {
      updatePayload.expected_return_datetime = new Date(updateRentalDto.expected_return_datetime);
    }
    if (updateRentalDto.actual_return_datetime) {
      updatePayload.actual_return_datetime = new Date(updateRentalDto.actual_return_datetime);
    }
    if (updateRentalDto.rated_at) {
      updatePayload.rated_at = new Date(updateRentalDto.rated_at);
    }

    const rental = await this.rentalRepository.findByIdAndUpdate(id, updatePayload, { new: true });
    if (!rental) {
      throw new NotFoundException("Rental not found");
    }

    return ResponseDetail.ok(rental);
  }

  async remove(id: string): Promise<ResponseMsg> {
    const rental = await this.rentalRepository.findByIdAndDelete(id);
    if (!rental) {
      throw new NotFoundException("Rental not found");
    }
    return ResponseMsg.ok("Rental deleted successfully");
  }

  private async ensureBookingExists(id: Types.ObjectId): Promise<void> {
    const exists = await this.bookingRepository.exists({ _id: id });
    if (!exists) {
      throw new NotFoundException("Booking not found");
    }
  }

  private async ensureVehicleExists(id: Types.ObjectId): Promise<void> {
    const exists = await this.vehicleRepository.exists({ _id: id });
    if (!exists) {
      throw new NotFoundException("Vehicle not found");
    }
  }
}
