import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";
import { Booking } from "src/models/booking.schema";
import { Kycs } from "src/models/kycs.schema";
import { Renter } from "src/models/renter.schema";
import { CreateBookingDto } from "./dto/createBooking.dto";
import { BookingAggregateResult, FacetResult, RenterJwtUserPayload, StaffJwtUserPayload } from "src/common/utils/type";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { KycStatus } from "src/common/enums/kyc.enum";
import { VehicleStatus } from "src/common/enums/vehicle.enum";
import { BadRequestException } from "src/common/exceptions/bad-request.exception";
import { VehicleService } from "../vehicles/vehicles.service";
import { calculateRentalDays, calculateRentalHours } from "src/common/utils/helper";
import { FeeService } from "../fees/fee.service";
import { FeeType } from "src/common/enums/fee.enum";
import { CreateFeeDto } from "../fees/dto/fee.dto";
import { PaymentMethod, PaymentStatus } from "src/common/enums/payment.enum";
import { MomoService } from "../payments/momo/momo.service";
import { PaymentService } from "../payments/payment.service";
import { CreatePaymentDto } from "../payments/dto/createPayment.dto";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { Role } from "src/common/enums/role.enum";
import { UsersService } from "../users/users.service";
import { UserWithRenterRole, UserWithStaffRole } from "src/common/interfaces/user.interface";
import { Staff } from "src/models/staff.schema";
import { BookingStatus, BookingVerificationStatus, RentalUntil } from "src/common/enums/booking.enum";
import { ChangeStatusBookingDto } from "./dto/changeStatus.dto";
import { RentalService } from "../rentals/rental.service";
import { User } from "src/models/user.schema";
import { CashService } from "../payments/cash/cash.service";
import { BookingPaginationDto } from "src/common/pagination/dto/booking/booking-pagination";
import { BookingFieldMapping } from "src/common/pagination/filters/booking-field-mapping";
import { applyCommonFiltersMongo } from "src/common/pagination/applyCommonFilters";
import { applySortingMongo } from "src/common/pagination/applySorting";
import { applyPaginationMongo } from "src/common/pagination/applyPagination";
import { applyFacetMongo } from "src/common/pagination/applyFacetMongo";
import { ResponseList } from "src/common/response/response-list";
import { buildPaginationResponse } from "src/common/pagination/pagination-response";
import { ResponseMsg } from "src/common/response/response-message";
import { BookingStatisticsDto, MonthlyRevenueDto, StatisticsPeriod } from "./dto/booking-statistics.dto";

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingRepository: Model<Booking>,
    @InjectModel(Kycs.name) private kycsRepository: Model<Kycs>,
    private vehicleService: VehicleService,
    private feeService: FeeService,
    private momoService: MomoService,
    private paymentService: PaymentService,
    private readonly userService: UsersService,
    private readonly rentalService: RentalService,
    @Inject(forwardRef(() => CashService))
    private readonly cashService: CashService,
  ) {}

  private ReturnBookingMapping(data: BookingAggregateResult): BookingAggregateResult {
    return {
      _id: data._id,
      rental_start_datetime: data.rental_start_datetime,
      expected_return_datetime: data.expected_return_datetime,
      status: data.status,
      verification_status: data.verification_status,
      total_booking_fee_amount: data.total_booking_fee_amount,
      deposit_fee_amount: data.deposit_fee_amount,
      rental_fee_amount: data.rental_fee_amount,
      created_at: data.created_at,
      verified_at: data.verified_at,
      renter:
        data.renter && data.renter.user
          ? {
              _id: data.renter._id,
              address: data.renter.address,
              date_of_birth: data.renter.date_of_birth,
              user: {
                _id: data.renter.user._id,
                full_name: data.renter.user.full_name,
                email: data.renter.user.email,
              },
            }
          : null,
      verified_staff:
        data.verified_staff && data.verified_staff.user
          ? {
              _id: data.verified_staff._id,
              employee_code: data.verified_staff.employee_code,
              position: data.verified_staff.position,
              user: {
                _id: data.verified_staff.user._id,
                full_name: data.verified_staff.user.full_name,
                email: data.verified_staff.user.email,
              },
            }
          : null,
      payment: data.payment
        ? {
            _id: data.payment._id,
            method: data.payment.method,
            amount_paid: data.payment.amount_paid,
            transaction_code: data.payment.transaction_code,
          }
        : null,
      fee: Array.isArray(data.fee)
        ? data.fee.map((feeItem) => ({
            _id: feeItem._id,
            type: feeItem.type,
            description: feeItem.description,
            amount: feeItem.amount,
          }))
        : [],
      vehicle: data.vehicle
        ? {
            _id: data.vehicle._id,
            make: data.vehicle.make,
            model: data.vehicle.model,
            model_year: data.vehicle.model_year,
            price_per_hour: data.vehicle.price_per_hour,
            price_per_day: data.vehicle.price_per_day,
            deposit_amount: data.vehicle.deposit_amount,
            station: data.vehicle.station
              ? {
                  _id: data.vehicle.station._id,
                  name: data.vehicle.station.name,
                  address: data.vehicle.station.address,
                  latitude: data.vehicle.station.latitude,
                  longitude: data.vehicle.station.longitude,
                  is_active: data.vehicle.station.is_active,
                }
              : null,
          }
        : null,
    };
  }

  private checkRenterKycStatusAndExpired = async (userId: string): Promise<boolean> => {
    // get renter id from user id
    const user = await this.userService.findOne(userId);
    if (!user || user.data?.role !== Role.RENTER) {
      throw new NotFoundException("This is not a renter");
    }
    if (!user.data.roleExtra) {
      throw new NotFoundException("Renter role data not found");
    }

    // Type guard: since role is RENTER, roleExtra must be Renter type
    const renterData = user.data.roleExtra as Renter & { _id: Types.ObjectId };
    const kyc = (await this.kycsRepository.findOne({ renter_id: renterData._id, status: KycStatus.APPROVED })) as Kycs;
    if (!kyc) {
      throw new NotFoundException("KYC not found");
    }
    const currentDate = new Date();

    if (!kyc.expiry_date) {
      throw new NotFoundException("KYC expiry date not found");
    }
    const expiryDate = new Date(kyc.expiry_date);
    const extendedExpiry = new Date(expiryDate);
    extendedExpiry.setFullYear(expiryDate.getFullYear() + 1);
    if (currentDate > extendedExpiry) {
      throw new NotFoundException("KYC expired");
    }
    return true;
  };

  checkRenterExist = async (userId: string): Promise<UserWithRenterRole> => {
    const user = await this.userService.findOne(userId);
    if (!user || !user.data) {
      throw new NotFoundException("Renter not found");
    }

    // Check role Renter
    if (user.data.role !== Role.RENTER) {
      throw new BadRequestException("Only renters can create bookings");
    }

    // Validate roleExtra exists and is Renter type
    if (!user.data.roleExtra) {
      throw new NotFoundException("Renter profile not found");
    }
    const userData = user.data as User & { _id: Types.ObjectId };
    // Type assertion: since role is RENTER, roleExtra must be Renter with _id
    const renterData = user.data.roleExtra as Renter & { _id: Types.ObjectId };

    return {
      ...userData,
      roleExtra: renterData,
    } as unknown as UserWithRenterRole;
  };

  checkStaffExists = async (userId: string): Promise<UserWithStaffRole> => {
    const user = await this.userService.findOne(userId);
    if (!user || !user.data) {
      throw new NotFoundException("Staff not found");
    }

    // Check role Staff
    if (user.data.role !== Role.STAFF) {
      throw new BadRequestException("Only staff can verify payments");
    }
    // Validate roleExtra exists and is Staff type
    if (!user.data.roleExtra) {
      throw new NotFoundException("Staff profile not found");
    }
    // Type assertion: since role is STAFF, roleExtra must be Staff with _id
    const staffData = user.data.roleExtra as Staff & { _id: Types.ObjectId };

    return {
      ...user.data,
      roleExtra: staffData,
    } as UserWithStaffRole;
  };

  private checkVehicle = async (
    vehicleId: string,
    rental_start: Date,
    expected_return: Date,
    rental_unit: RentalUntil,
  ): Promise<{
    rental_hours?: number;
    rental_days?: number;
    total_booking_fee_amount: number;
    deposit_fee_amount: number;
    rental_fee_amount: number;
  }> => {
    const vehicle = await this.vehicleService.findOne(vehicleId);
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    const vehicleData = vehicle.data;
    if (!vehicleData) {
      throw new BadRequestException("Vehicle is not active");
    }

    if (vehicleData.status !== VehicleStatus.AVAILABLE) {
      throw new BadRequestException("Vehicle not available");
    }

    const startTime = new Date(rental_start);
    const endTime = new Date(expected_return);

    if (startTime >= endTime) {
      throw new BadRequestException("Expected return time must be after rental start time");
    }

    // --- ✅ Xác định hình thức tính ---

    let rental_fee_amount = 0;
    let rental_days: number | undefined;
    let rental_hours: number | undefined;

    // --- Theo giờ ---
    if (rental_unit === RentalUntil.HOURS) {
      rental_hours = calculateRentalHours(startTime, endTime);
      rental_fee_amount = vehicleData.price_per_hour * rental_hours;
    }
    // --- Theo ngày ---
    else if (rental_unit === RentalUntil.DAYS) {
      rental_days = calculateRentalDays(startTime, endTime);
      rental_fee_amount = vehicleData.price_per_day * rental_days;
    } else {
      throw new BadRequestException("Invalid rental unit");
    }

    const deposit_fee_amount = vehicleData.deposit_amount;
    const total_booking_fee_amount = rental_fee_amount + deposit_fee_amount;

    return {
      rental_hours,
      rental_days,
      total_booking_fee_amount,
      deposit_fee_amount,
      rental_fee_amount,
    };
  };

  private async getPaymentCode(createBookingDto: CreateBookingDto): Promise<{ orderId: string; payUrl: string }> {
    switch (createBookingDto.payment_method) {
      case PaymentMethod.CASH:
        return this.cashService.create();
      case PaymentMethod.BANK_TRANSFER:
        return this.momoService.create(createBookingDto.total_amount.toString());
      default:
        throw new BadRequestException("Unsupported payment method");
    }
  }

  private async handleVerificationStatusChange(
    booking: Booking & { _id: Types.ObjectId },
    changeStatus: ChangeStatusBookingDto,
    staffId: Types.ObjectId,
  ): Promise<void> {
    switch (changeStatus.verification_status) {
      case BookingVerificationStatus.APPROVED:
        // Approve booking - vehicle is ready for pickup
        booking.verification_status = BookingVerificationStatus.APPROVED;
        booking.verified_by_staff_id = staffId;
        booking.verified_at = new Date();

        // Validate required fields before creating rental
        if (!booking._id) {
          throw new BadRequestException("Booking ID is missing");
        }
        if (!booking.vehicle_id) {
          throw new BadRequestException("Vehicle ID is missing from booking");
        }

        // create rental record
        // step 6 create rental record
        await this.rentalService.create({
          booking_id: booking._id.toString(),
          vehicle_id: booking.vehicle_id.toString(),
          pickup_datetime: new Date(),
        });
        break;

      case BookingVerificationStatus.REJECTED_MISMATCH:
      case BookingVerificationStatus.REJECTED_OTHER:
        // Reject booking - need cancel reason
        if (!changeStatus.cancel_reason || changeStatus.cancel_reason.trim() === "") {
          throw new BadRequestException("Cancel reason is required when rejecting a booking");
        }
        booking.verification_status = changeStatus.verification_status;
        booking.verified_by_staff_id = staffId;
        booking.verified_at = new Date();
        booking.cancel_reason = changeStatus.cancel_reason;

        // Reject booking -> Update booking status to CANCELLED
        booking.status = BookingStatus.CANCELLED;

        // TODO: Refund logic - return money to customer
        // Update vehicle status back to AVAILABLE
        if (booking.vehicle_id) {
          await this.vehicleService.updateVehicleStatus(booking.vehicle_id.toString(), { status: VehicleStatus.AVAILABLE });
        }
        break;

      case BookingVerificationStatus.PENDING:
        // Change back to pending
        booking.verification_status = BookingVerificationStatus.PENDING;
        booking.verified_by_staff_id = staffId;
        booking.verified_at = new Date();
        break;

      default:
        throw new BadRequestException("Invalid verification status");
    }
  }

  async createBooking(createBookingDto: CreateBookingDto, user: RenterJwtUserPayload): Promise<ResponseDetail<{ payUrl: string }>> {
    // Step 1: Validate renter exists and get renter data
    const renterUser = await this.checkRenterExist(user._id);

    // Step 2: Validate KYC status and expiry
    await this.checkRenterKycStatusAndExpired(user._id);

    // Step 3: Validate vehicle availability and calculate fees (backend calculation)
    const vehicleData = await this.checkVehicle(
      createBookingDto.vehicle_id,
      new Date(createBookingDto.rental_start_datetime),
      new Date(createBookingDto.expected_return_datetime),
      createBookingDto.rental_until,
    );
    // Step 4: check calculated total amount matches client sent amount
    if (vehicleData.total_booking_fee_amount !== createBookingDto.total_amount) {
      throw new BadRequestException("Total amount mismatch. Please refresh and try again.");
    }

    // Step 5: Initialize payment gateway (use backend calculated amount)
    const paymentCode = await this.getPaymentCode(createBookingDto);
    if (!paymentCode || !paymentCode.orderId || !paymentCode.payUrl) {
      throw new BadRequestException("Failed to initialize payment");
    }
    // Step 6: Create booking record with PENDING_VERIFICATION status
    const newBooking = new this.bookingRepository({
      renter_id: renterUser.roleExtra._id,
      vehicle_id: createBookingDto.vehicle_id,
      rental_start_datetime: createBookingDto.rental_start_datetime,
      expected_return_datetime: createBookingDto.expected_return_datetime,
      total_booking_fee_amount: vehicleData.total_booking_fee_amount,
      deposit_fee_amount: vehicleData.deposit_fee_amount,
      rental_fee_amount: vehicleData.rental_fee_amount,
      rental_until: createBookingDto.rental_until,
      status: createBookingDto.payment_method === PaymentMethod.CASH ? BookingStatus.VERIFIED : BookingStatus.PENDING_VERIFICATION,
    });
    await newBooking.save();

    // Step 6: Update vehicle status from AVAILABLE to PENDING (waiting for payment)
    await this.vehicleService.updateVehicleStatus(createBookingDto.vehicle_id, { status: VehicleStatus.PENDING });

    // Step 7: Create fee records
    const rentalFeeRecord: CreateFeeDto = {
      booking_id: newBooking._id.toString(),
      amount: vehicleData.rental_fee_amount,
      type: FeeType.RENTAL_FEE,
      description: `${createBookingDto.rental_until === RentalUntil.HOURS ? "Hourly" : "Daily"} rental fee for booking`,
      currency: "VND",
    };
    await this.feeService.create(rentalFeeRecord);

    // Step 7: Create deposit fee record
    const depositFeeRecord: CreateFeeDto = {
      booking_id: newBooking._id.toString(),
      amount: vehicleData.deposit_fee_amount,
      type: FeeType.DEPOSIT_FEE,
      description: `${createBookingDto.rental_until === RentalUntil.HOURS ? "Hourly" : "Daily"} deposit fee for booking`,
      currency: "VND",
    };
    await this.feeService.create(depositFeeRecord);

    // Step 8: Create payment record with PENDING status
    const paymentRecord: CreatePaymentDto = {
      booking_id: newBooking._id.toString(),
      method: createBookingDto.payment_method,
      amount_paid: vehicleData.total_booking_fee_amount,
      transaction_code: paymentCode.orderId,
    };
    await this.paymentService.create(paymentRecord);

    // Step 9: Return payment URL
    return ResponseDetail.ok({ payUrl: paymentCode.payUrl });
  }

  async confirmBooking(id: string, user: StaffJwtUserPayload, changeStatus: ChangeStatusBookingDto): Promise<ResponseMsg> {
    // Step 1: Validate staff exists
    const staffUser = await this.checkStaffExists(user._id);
    // Step 2: Find booking
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    // Step 3: Validate booking status
    if (booking.status !== BookingStatus.VERIFIED) {
      throw new BadRequestException("Booking must be in VERIFIED status (payment confirmed) before staff verification");
    }

    // Step 4: Handle different verification statuses
    await this.handleVerificationStatusChange(booking, changeStatus, staffUser.roleExtra._id);

    // Step 5: Save booking
    await booking.save();

    return ResponseMsg.ok("Booking verification status updated successfully");
  }

  async getAllBookings(filters: BookingPaginationDto): Promise<ResponseList<BookingAggregateResult>> {
    const pipeline: any[] = [];
    pipeline.push(
      {
        $lookup: {
          from: "renters",
          localField: "renter_id",
          foreignField: "_id",
          as: "renter",
        },
      },
      {
        $unwind: { path: "$renter", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "renter.user_id",
          foreignField: "_id",
          as: "renter.user",
        },
      },
      {
        $unwind: { path: "$renter.user", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "staffs",
          localField: "verified_by_staff_id",
          foreignField: "_id",
          as: "verified_staff",
        },
      },
      {
        $unwind: { path: "$verified_staff", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "verified_staff.user_id",
          foreignField: "_id",
          as: "verified_staff.user",
        },
      },
      {
        $unwind: { path: "$verified_staff.user", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "booking_id",
          as: "payments",
        },
      },
      {
        $addFields: {
          payment: { $arrayElemAt: ["$payments", 0] },
        },
      },
      {
        $lookup: {
          from: "fees",
          localField: "_id",
          foreignField: "booking_id",
          as: "fee",
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicle_id",
          foreignField: "_id",
          as: "vehicle",
          pipeline: [
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
          ],
        },
      },
      {
        $addFields: {
          vehicle: { $arrayElemAt: ["$vehicle", 0] },
        },
      },
    );
    applyCommonFiltersMongo(pipeline, filters, BookingFieldMapping);
    const allowedSortFields = ["total_booking_fee_amount", "create_at", "status"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "created_at");
    pipeline.push({
      $project: {
        _id: 1,
        rental_start_datetime: 1,
        expected_return_datetime: 1,
        status: 1,
        verification_status: 1,
        total_booking_fee_amount: 1,
        deposit_fee_amount: 1,
        rental_fee_amount: 1,
        renter: 1,
        verified_staff: 1,
        payment: 1,
        fee: 1,
        vehicle: 1,
        created_at: 1,
        verified_at: 1,
      },
    });
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);
    const result = (await this.bookingRepository.aggregate(pipeline)) as FacetResult<BookingAggregateResult>;
    const data = result[0]?.data || [];
    const mappedData = data.map((booking) => this.ReturnBookingMapping(booking));
    const total = result[0]?.meta?.[0]?.total || 0;
    return ResponseList.ok(buildPaginationResponse(mappedData, { total, page: filters.page, take: filters.take }));
  }

  async getBookingById(id: string): Promise<ResponseDetail<BookingAggregateResult>> {
    const pipeline: any[] = [];
    pipeline.push(
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "renters",
          localField: "renter_id",
          foreignField: "_id",
          as: "renter",
        },
      },
      {
        $unwind: { path: "$renter", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "renter.user_id",
          foreignField: "_id",
          as: "renter.user",
        },
      },
      {
        $unwind: { path: "$renter.user", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "staffs",
          localField: "verified_by_staff_id",
          foreignField: "_id",
          as: "verified_staff",
        },
      },
      {
        $unwind: { path: "$verified_staff", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "verified_staff.user_id",
          foreignField: "_id",
          as: "verified_staff.user",
        },
      },
      {
        $unwind: { path: "$verified_staff.user", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "booking_id",
          as: "payments",
        },
      },
      {
        $addFields: {
          payment: { $arrayElemAt: ["$payments", 0] },
        },
      },
      {
        $lookup: {
          from: "fees",
          localField: "_id",
          foreignField: "booking_id",
          as: "fee",
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicle_id",
          foreignField: "_id",
          as: "vehicle",
          pipeline: [
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
          ],
        },
      },
      {
        $addFields: {
          vehicle: { $arrayElemAt: ["$vehicle", 0] },
        },
      },
    );
    pipeline.push({
      $project: {
        _id: 1,
        rental_start_datetime: 1,
        expected_return_datetime: 1,
        status: 1,
        verification_status: 1,
        total_booking_fee_amount: 1,
        deposit_fee_amount: 1,
        rental_fee_amount: 1,
        renter: 1,
        verified_staff: 1,
        payment: 1,
        fee: 1,
        vehicle: 1,
        created_at: 1,
        verified_at: 1,
      },
    });
    const result = await this.bookingRepository.aggregate(pipeline);
    const booking = result[0] as BookingAggregateResult;

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    const mappedBooking = this.ReturnBookingMapping(booking);
    return ResponseDetail.ok(mappedBooking);
  }

  async cancelBooking(id: string): Promise<ResponseMsg> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    // check status
    if (booking.status !== BookingStatus.PENDING_VERIFICATION) {
      throw new BadRequestException("Only bookings with PENDING_VERIFICATION status can be deleted");
    }
    if (booking.verification_status !== BookingVerificationStatus.PENDING) {
      throw new BadRequestException("Only bookings with PENDING verification status can be deleted");
    }
    // convert vehicle in station to AVAILABLE
    await this.vehicleService.updateVehicleStatus(booking.vehicle_id.toString(), { status: VehicleStatus.AVAILABLE });
    // convert payment to failed
    await this.paymentService.changeStatus(booking._id.toString(), PaymentStatus.FAILED);

    await this.bookingRepository.findByIdAndUpdate(id, { status: BookingStatus.CANCELLED });
    return ResponseMsg.ok("Booking deleted successfully");
  }

  async getBookingByRenter(filters: BookingPaginationDto, user: RenterJwtUserPayload): Promise<ResponseList<BookingAggregateResult>> {
    const userData = await this.userService.findOneRenter(user._id);
    if (!userData || !userData.data) {
      throw new NotFoundException("Renter not found");
    }

    const renter = userData.data as UserWithRenterRole;
    const pipeline: any[] = [];
    pipeline.push(
      {
        $match: { renter_id: new mongoose.Types.ObjectId(renter.roleExtra?._id) },
      },
      {
        $lookup: {
          from: "renters",
          localField: "renter_id",
          foreignField: "_id",
          as: "renter",
        },
      },
      {
        $unwind: { path: "$renter", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "renter.user_id",
          foreignField: "_id",
          as: "renter.user",
        },
      },
      {
        $unwind: { path: "$renter.user", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "staffs",
          localField: "verified_by_staff_id",
          foreignField: "_id",
          as: "verified_staff",
        },
      },
      {
        $unwind: { path: "$verified_staff", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "verified_staff.user_id",
          foreignField: "_id",
          as: "verified_staff.user",
        },
      },
      {
        $unwind: { path: "$verified_staff.user", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "booking_id",
          as: "payments",
        },
      },
      {
        $addFields: {
          payment: { $arrayElemAt: ["$payments", 0] },
        },
      },
      {
        $lookup: {
          from: "fees",
          localField: "_id",
          foreignField: "booking_id",
          as: "fee",
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicle_id",
          foreignField: "_id",
          as: "vehicle",
          pipeline: [
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
          ],
        },
      },
      {
        $addFields: {
          vehicle: { $arrayElemAt: ["$vehicle", 0] },
        },
      },
    );
    applyCommonFiltersMongo(pipeline, filters, BookingFieldMapping);
    const allowedSortFields = ["total_booking_fee_amount", "create_at", "status"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "created_at");
    pipeline.push({
      $project: {
        _id: 1,
        rental_start_datetime: 1,
        expected_return_datetime: 1,
        status: 1,
        verification_status: 1,
        total_booking_fee_amount: 1,
        deposit_fee_amount: 1,
        rental_fee_amount: 1,
        renter: 1,
        verified_staff: 1,
        payment: 1,
        fee: 1,
        vehicle: 1,
        created_at: 1,
        verified_at: 1,
      },
    });
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);
    const result = (await this.bookingRepository.aggregate(pipeline)) as FacetResult<BookingAggregateResult>;
    const data = result[0]?.data || [];
    const mappedData = data.map((booking) => this.ReturnBookingMapping(booking));
    const total = result[0]?.meta?.[0]?.total || 0;

    return ResponseList.ok(buildPaginationResponse(mappedData, { total, page: filters.page, take: filters.take }));
  }

  // ==================== STATISTICS ====================

  /**
   * Get monthly revenue statistics
   * Returns total revenue for each month in the specified year
   */
  async getMonthlyRevenue(dto: MonthlyRevenueDto): Promise<ResponseDetail<any>> {
    const year = dto.year || new Date().getFullYear();
    const startDate = new Date(year, 0, 1); // January 1st
    const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st

    const pipeline: any[] = [
      {
        $match: {
          created_at: {
            $gte: startDate,
            $lte: endDate,
          },
          status: BookingStatus.VERIFIED, // Only count verified bookings
        },
      },
      {
        $group: {
          _id: { $month: "$created_at" },
          totalRevenue: { $sum: "$total_booking_fee_amount" },
          totalBookings: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          totalRevenue: 1,
          totalBookings: 1,
        },
      },
      { $sort: { month: 1 } },
    ];

    const result = await this.bookingRepository.aggregate(pipeline);

    // Fill in missing months with zero revenue
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const monthData = result.find((r: any) => r.month === i + 1);
      return {
        month: i + 1,
        monthName: new Date(year, i).toLocaleString("en-US", { month: "long" }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        totalRevenue: monthData?.totalRevenue || 0,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        totalBookings: monthData?.totalBookings || 0,
      };
    });

    return ResponseDetail.ok({
      data: monthlyData,
      year,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
      totalYearRevenue: monthlyData.reduce((sum, m) => sum + m.totalRevenue, 0),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
      totalYearBookings: monthlyData.reduce((sum, m) => sum + m.totalBookings, 0),
    });
  }

  /**
   * Get booking count statistics by period (day, week, month)
   */
  async getBookingStatistics(dto: BookingStatisticsDto): Promise<ResponseDetail<any>> {
    const year = dto.year || new Date().getFullYear();
    const month = dto.month || new Date().getMonth() + 1;

    let pipeline: any[] = [];
    let startDate: Date;
    let endDate: Date;

    switch (dto.period) {
      case StatisticsPeriod.DAY: {
        // Statistics by day for the specified month
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

        pipeline = [
          {
            $match: {
              created_at: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
          {
            $group: {
              _id: { $dayOfMonth: "$created_at" },
              totalBookings: { $sum: 1 },
              totalRevenue: { $sum: "$total_booking_fee_amount" },
              verifiedBookings: {
                $sum: { $cond: [{ $eq: ["$status", BookingStatus.VERIFIED] }, 1, 0] },
              },
              pendingBookings: {
                $sum: { $cond: [{ $eq: ["$status", BookingStatus.PENDING_VERIFICATION] }, 1, 0] },
              },
              cancelledBookings: {
                $sum: { $cond: [{ $eq: ["$status", BookingStatus.CANCELLED] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              day: "$_id",
              totalBookings: 1,
              totalRevenue: 1,
              verifiedBookings: 1,
              pendingBookings: 1,
              cancelledBookings: 1,
            },
          },
          { $sort: { day: 1 } },
        ];

        const dayResults = await this.bookingRepository.aggregate(pipeline);
        const daysInMonth = new Date(year, month, 0).getDate();
        const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const dayData = dayResults.find((r) => r.day === i + 1);
          return {
            day: i + 1,
            date: new Date(year, month - 1, i + 1).toISOString().split("T")[0],
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            totalBookings: dayData?.totalBookings || 0,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            totalRevenue: dayData?.totalRevenue || 0,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            verifiedBookings: dayData?.verifiedBookings || 0,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            pendingBookings: dayData?.pendingBookings || 0,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            cancelledBookings: dayData?.cancelledBookings || 0,
          };
        });

        return ResponseDetail.ok({
          period: "day",
          year,
          month,
          data: dailyData,
          summary: {
            totalBookings: dailyData.reduce((sum: number, d) => sum + (d.totalBookings as number), 0),
            totalRevenue: dailyData.reduce((sum: number, d) => sum + (d.totalRevenue as number), 0),
            verifiedBookings: dailyData.reduce((sum: number, d) => sum + (d.verifiedBookings as number), 0),
            pendingBookings: dailyData.reduce((sum: number, d) => sum + (d.pendingBookings as number), 0),
            cancelledBookings: dailyData.reduce((sum: number, d) => sum + (d.cancelledBookings as number), 0),
          },
        });
      }

      case StatisticsPeriod.WEEK: {
        // Statistics by week for the specified month
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59);

        pipeline = [
          {
            $match: {
              created_at: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
          {
            $group: {
              _id: { $week: "$created_at" },
              totalBookings: { $sum: 1 },
              totalRevenue: { $sum: "$total_booking_fee_amount" },
              verifiedBookings: {
                $sum: { $cond: [{ $eq: ["$status", BookingStatus.VERIFIED] }, 1, 0] },
              },
              pendingBookings: {
                $sum: { $cond: [{ $eq: ["$status", BookingStatus.PENDING_VERIFICATION] }, 1, 0] },
              },
              cancelledBookings: {
                $sum: { $cond: [{ $eq: ["$status", BookingStatus.CANCELLED] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              week: "$_id",
              totalBookings: 1,
              totalRevenue: 1,
              verifiedBookings: 1,
              pendingBookings: 1,
              cancelledBookings: 1,
            },
          },
          { $sort: { week: 1 } },
        ];

        const weekResults = await this.bookingRepository.aggregate(pipeline);

        return ResponseDetail.ok({
          period: "week",
          year,
          month,
          data: weekResults,
          summary: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            totalBookings: weekResults.reduce((sum: number, w: any) => sum + (w.totalBookings as number), 0),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            totalRevenue: weekResults.reduce((sum: number, w: any) => sum + (w.totalRevenue as number), 0),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            verifiedBookings: weekResults.reduce((sum: number, w: any) => sum + (w.verifiedBookings as number), 0),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            pendingBookings: weekResults.reduce((sum: number, w: any) => sum + (w.pendingBookings as number), 0),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            cancelledBookings: weekResults.reduce((sum: number, w: any) => sum + (w.cancelledBookings as number), 0),
          },
        });
      }

      case StatisticsPeriod.MONTH: {
        // Statistics by month for the specified year
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31, 23, 59, 59);

        pipeline = [
          {
            $match: {
              created_at: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
          {
            $group: {
              _id: { $month: "$created_at" },
              totalBookings: { $sum: 1 },
              totalRevenue: { $sum: "$total_booking_fee_amount" },
              verifiedBookings: {
                $sum: { $cond: [{ $eq: ["$status", BookingStatus.VERIFIED] }, 1, 0] },
              },
              pendingBookings: {
                $sum: { $cond: [{ $eq: ["$status", BookingStatus.PENDING_VERIFICATION] }, 1, 0] },
              },
              cancelledBookings: {
                $sum: { $cond: [{ $eq: ["$status", BookingStatus.CANCELLED] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              month: "$_id",
              totalBookings: 1,
              totalRevenue: 1,
              verifiedBookings: 1,
              pendingBookings: 1,
              cancelledBookings: 1,
            },
          },
          { $sort: { month: 1 } },
        ];

        const monthResults = await this.bookingRepository.aggregate(pipeline);
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const monthData = monthResults.find((r) => r.month === i + 1);
          return {
            month: i + 1,
            monthName: new Date(year, i).toLocaleString("en-US", { month: "long" }),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            totalBookings: monthData?.totalBookings || 0,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            totalRevenue: monthData?.totalRevenue || 0,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            verifiedBookings: monthData?.verifiedBookings || 0,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            pendingBookings: monthData?.pendingBookings || 0,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            cancelledBookings: monthData?.cancelledBookings || 0,
          };
        });

        return ResponseDetail.ok({
          period: "month",
          year,
          data: monthlyData,
          summary: {
            totalBookings: monthlyData.reduce((sum: number, m) => sum + (m.totalBookings as number), 0),
            totalRevenue: monthlyData.reduce((sum: number, m) => sum + (m.totalRevenue as number), 0),
            verifiedBookings: monthlyData.reduce((sum: number, m) => sum + (m.verifiedBookings as number), 0),
            pendingBookings: monthlyData.reduce((sum: number, m) => sum + (m.pendingBookings as number), 0),
            cancelledBookings: monthlyData.reduce((sum: number, m) => sum + (m.cancelledBookings as number), 0),
          },
        });
      }

      default:
        throw new BadRequestException("Invalid period specified");
    }
  }
}
