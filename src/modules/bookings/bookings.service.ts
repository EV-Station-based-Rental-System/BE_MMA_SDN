import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { Booking, BookingDocument } from "src/models/booking.schema";
import { Renter, RenterDocument } from "src/models/renter.schema";
import { VehicleAtStation, VehicleAtStationDocument } from "src/models/vehicle_at_station.schema";
import { Staff, StaffDocument } from "src/models/staff.schema";
import { Rental, RentalDocument } from "src/models/rental.schema";
import { BookingPaginationDto } from "src/common/pagination/dto/booking/booking-pagination.dto";
import { BookingFieldMapping } from "src/common/pagination/filters/booking-field-mapping";
import { applyCommonFiltersMongo } from "src/common/pagination/applyCommonFilters";
import { applySortingMongo } from "src/common/pagination/applySorting";
import { applyPaginationMongo } from "src/common/pagination/applyPagination";
import { applyFacetMongo } from "src/common/pagination/applyFacetMongo";
import { buildPaginationResponse } from "src/common/pagination/pagination-response";
import { FacetResult } from "src/common/utils/type";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseList } from "src/common/response/response-list";
import { ResponseMsg } from "src/common/response/response-message";
import { ForbiddenException } from "src/common/exceptions/forbidden.exception";
import { CancelBookingDto } from "./dto/cancel-booking.dto";
import { BookingStatus, BookingVerificationStatus } from "src/common/enums/booking.enum";

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingRepository: Model<BookingDocument>,
    @InjectModel(Renter.name) private readonly renterRepository: Model<RenterDocument>,
    @InjectModel(VehicleAtStation.name) private readonly vehicleAtStationRepository: Model<VehicleAtStationDocument>,
    @InjectModel(Staff.name) private readonly staffRepository: Model<StaffDocument>,
    @InjectModel(Rental.name) private readonly rentalRepository: Model<RentalDocument>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<ResponseDetail<Booking>> {
    await this.ensureRenterExists(createBookingDto.renter_id);
    await this.ensureVehicleAtStationExists(createBookingDto.vehicle_at_station_id);
    if (createBookingDto.verified_by_staff_id) {
      await this.ensureStaffExists(createBookingDto.verified_by_staff_id);
    }

    const booking = await this.bookingRepository.create({
      ...createBookingDto,
      renter_id: new Types.ObjectId(createBookingDto.renter_id),
      vehicle_at_station_id: new Types.ObjectId(createBookingDto.vehicle_at_station_id),
      verified_by_staff_id: createBookingDto.verified_by_staff_id ? new Types.ObjectId(createBookingDto.verified_by_staff_id) : undefined,
      verified_at: createBookingDto.verified_at ? new Date(createBookingDto.verified_at) : undefined,
      expected_return_datetime: createBookingDto.expected_return_datetime ? new Date(createBookingDto.expected_return_datetime) : undefined,
    });

    return ResponseDetail.ok(booking);
  }

  async findAll(filters: BookingPaginationDto): Promise<ResponseList<Booking>> {
    const pipeline: any[] = [];
    const matchStage: { created_at?: { $gte?: Date; $lte?: Date } } & Record<string, unknown> = {};

    if (filters.renter_id) {
      matchStage.renter_id = new Types.ObjectId(filters.renter_id);
    }
    if (filters.vehicle_at_station_id) {
      matchStage.vehicle_at_station_id = new Types.ObjectId(filters.vehicle_at_station_id);
    }
    if (filters.verified_by_staff_id) {
      matchStage.verified_by_staff_id = new Types.ObjectId(filters.verified_by_staff_id);
    }
    if (filters.created_from || filters.created_to) {
      matchStage.created_at = {} as { $gte?: Date; $lte?: Date };
      if (filters.created_from) matchStage.created_at.$gte = new Date(filters.created_from);
      if (filters.created_to) matchStage.created_at.$lte = new Date(filters.created_to);
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    applyCommonFiltersMongo(pipeline, filters, BookingFieldMapping);
    const allowedSortFields = ["created_at", "status", "verification_status"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "created_at");
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);

    const result = (await this.bookingRepository.aggregate(pipeline)) as FacetResult<Booking>;
    const bookings = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;

    return ResponseList.ok(buildPaginationResponse(bookings, { total, page: filters.page, take: filters.take }));
  }

  async findMine(userId: string, filters: BookingPaginationDto): Promise<ResponseList<Booking>> {
    return this.findAll({ ...filters, renter_id: userId });
  }

  async findOne(id: string): Promise<ResponseDetail<Booking>> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return ResponseDetail.ok(booking);
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<ResponseDetail<Booking>> {
    const updatePayload: Record<string, any> = { ...updateBookingDto };

    if (updateBookingDto.renter_id) {
      await this.ensureRenterExists(updateBookingDto.renter_id);
      updatePayload.renter_id = new Types.ObjectId(updateBookingDto.renter_id);
    }

    if (updateBookingDto.vehicle_at_station_id) {
      await this.ensureVehicleAtStationExists(updateBookingDto.vehicle_at_station_id);
      updatePayload.vehicle_at_station_id = new Types.ObjectId(updateBookingDto.vehicle_at_station_id);
    }

    if (updateBookingDto.verified_by_staff_id) {
      await this.ensureStaffExists(updateBookingDto.verified_by_staff_id);
      updatePayload.verified_by_staff_id = new Types.ObjectId(updateBookingDto.verified_by_staff_id);
    }

    if (updateBookingDto.verified_at) {
      updatePayload.verified_at = new Date(updateBookingDto.verified_at);
    }

    if (updateBookingDto.expected_return_datetime) {
      updatePayload.expected_return_datetime = new Date(updateBookingDto.expected_return_datetime);
    }

    const booking = await this.bookingRepository.findByIdAndUpdate(id, updatePayload, { new: true });
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return ResponseDetail.ok(booking);
  }

  async remove(id: string): Promise<ResponseMsg> {
    const rentalExists = await this.rentalRepository.exists({ booking_id: new Types.ObjectId(id) });
    if (rentalExists) {
      throw new ConflictException("Cannot delete booking with existing rental");
    }

    const result = await this.bookingRepository.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException("Booking not found");
    }

    return ResponseMsg.ok("Booking deleted successfully");
  }

  async cancel(id: string, userId: string, cancelBookingDto: CancelBookingDto): Promise<ResponseDetail<Booking>> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.renter_id.toString() !== userId) {
      throw new ForbiddenException("Cannot cancel booking that does not belong to you");
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new ConflictException("Booking already cancelled");
    }

    booking.status = BookingStatus.CANCELLED;
    booking.verification_status = BookingVerificationStatus.REJECTED_OTHER;
    booking.cancel_reason = cancelBookingDto.reason ?? booking.cancel_reason;
    booking.verified_by_staff_id = undefined;
    booking.verified_at = undefined;

    const saved = await booking.save();
    return ResponseDetail.ok(saved);
  }

  private async ensureRenterExists(renterId: string): Promise<void> {
    const exists = await this.renterRepository.exists({ _id: new Types.ObjectId(renterId) });
    if (!exists) {
      throw new NotFoundException("Renter not found");
    }
  }

  private async ensureVehicleAtStationExists(vehicleAtStationId: string): Promise<void> {
    const exists = await this.vehicleAtStationRepository.exists({ _id: new Types.ObjectId(vehicleAtStationId) });
    if (!exists) {
      throw new NotFoundException("Vehicle at station not found");
    }
  }

  private async ensureStaffExists(staffId: string): Promise<void> {
    const exists = await this.staffRepository.exists({ _id: new Types.ObjectId(staffId) });
    if (!exists) {
      throw new NotFoundException("Staff not found");
    }
  }
}
