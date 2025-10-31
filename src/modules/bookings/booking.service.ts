import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";
import { Booking } from "src/models/booking.schema";
import { Kycs } from "src/models/kycs.schema";
import { Renter } from "src/models/renter.schema";
import { CreateBookingDto } from "./dto/createBooking.dto";
import { FacetResult, RenterJwtUserPayload, StaffJwtUserPayload, VehicleAtStationResponse } from "src/common/utils/type";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { KycStatus } from "src/common/enums/kyc.enum";
import { StatusVehicleAtStation } from "src/common/enums/vehicle_at_station.enum";
import { BadRequestException } from "src/common/exceptions/bad-request.exception";
import { VehicleStationService } from "../vehicle_station/vehicle_station.service";
import { calculateRentalDays } from "src/common/utils/helper";
import { FeeService } from "../fees/fee.service";
import { FeeType } from "src/common/enums/fee.enum";
import { CreateFeeDto } from "../fees/dto/fee.dto";
import { PaymentMethod } from "src/common/enums/payment.enum";
import { MomoService } from "../payments/momo/momo.service";
import { PaymentService } from "../payments/payment.service";
import { CreatePaymentDto } from "../payments/dto/createPayment.dto";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { Role } from "src/common/enums/role.enum";
import { UsersService } from "../users/users.service";
import { UserWithRenterRole, UserWithStaffRole } from "src/common/interfaces/user.interface";
import { Staff } from "src/models/staff.schema";
import { BookingStatus, BookingVerificationStatus } from "src/common/enums/booking.enum";
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

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingRepository: Model<Booking>,
    @InjectModel(Kycs.name) private kycsRepository: Model<Kycs>,

    private vehicleStationService: VehicleStationService,
    private feeService: FeeService,
    private momoService: MomoService,
    private paymentService: PaymentService,
    private readonly userService: UsersService,
    private readonly rentalService: RentalService,

    @Inject(forwardRef(() => CashService))
    private readonly cashService: CashService,
  ) {}

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
    const kyc = await this.kycsRepository.findOne({ renter_id: renterData._id, status: KycStatus.APPROVED });
    if (!kyc) {
      throw new NotFoundException("KYC not found");
    }
    const currentDate = new Date();
    if (kyc.verified_at) {
      const expiryDate = new Date(kyc.verified_at);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      if (currentDate > expiryDate) {
        throw new NotFoundException("KYC expired");
      }
    } else {
      throw new NotFoundException("KYC verified date not found");
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
  private checkVehicleAtStation = async (
    vehicleAtStationId: string,
    rental_start: Date,
    expected_return: Date,
  ): Promise<
    VehicleAtStationResponse & { rental_days: number; total_booking_fee_amount: number; deposit_fee_amount: number; rental_fee_amount: number }
  > => {
    const vehicleAtStation = await this.vehicleStationService.findOne(vehicleAtStationId);
    if (!vehicleAtStation) {
      throw new NotFoundException("Vehicle at station not found");
    }

    const data = vehicleAtStation.data;
    if (!data) {
      throw new NotFoundException("Invalid vehicle at station data");
    }

    if ((data.status as StatusVehicleAtStation) !== StatusVehicleAtStation.AVAILABLE) {
      throw new BadRequestException("Vehicle at station not available");
    }

    const startTime = new Date(rental_start);
    const endTime = new Date(expected_return);

    if (startTime >= endTime) {
      throw new BadRequestException("Expected return time must be after rental start time");
    }

    if (data.start_time && data.end_time) {
      const availableFrom = new Date(data.start_time);
      const availableTo = new Date(data.end_time);

      if (startTime < availableFrom || endTime > availableTo) {
        throw new BadRequestException("Vehicle not available for the selected time range");
      }
    }

    // Calculate fees (rental_fee = price_per_day * days, NOT days * rental_fee)
    const rentalDays = calculateRentalDays(startTime, endTime);
    const deposit_fee_amount = data.pricing ? data.pricing.deposit_amount : 0;
    const rental_fee_amount = data.pricing ? data.pricing.price_per_day * rentalDays : 0;
    const total_booking_fee_amount = rental_fee_amount + deposit_fee_amount;

    return {
      ...data,
      rental_days: rentalDays,
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
        // create rental record
        // step 6 create rental record
        await this.rentalService.create({
          booking_id: booking._id.toString(),
          vehicle_id: booking.vehicle_at_station_id.toString(),
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
        await this.vehicleStationService.changeStatus(booking.vehicle_at_station_id.toString(), { status: StatusVehicleAtStation.AVAILABLE });
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
    const vehicleAtStationData = await this.checkVehicleAtStation(
      createBookingDto.vehicle_at_station_id,
      new Date(createBookingDto.rental_start_datetime),
      new Date(createBookingDto.expected_return_datetime),
    );
    console.log(vehicleAtStationData.total_booking_fee_amount);
    // Step 4: check calculated total amount matches client sent amount
    if (vehicleAtStationData.total_booking_fee_amount !== createBookingDto.total_amount) {
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
      vehicle_at_station_id: createBookingDto.vehicle_at_station_id,
      rental_start_datetime: createBookingDto.rental_start_datetime,
      expected_return_datetime: createBookingDto.expected_return_datetime,
      total_booking_fee_amount: vehicleAtStationData.total_booking_fee_amount,
      deposit_fee_amount: vehicleAtStationData.deposit_fee_amount,
      rental_fee_amount: vehicleAtStationData.rental_fee_amount,
      status: createBookingDto.payment_method === PaymentMethod.CASH ? BookingStatus.VERIFIED : BookingStatus.PENDING_VERIFICATION,
    });
    await newBooking.save();

    // Step 6: Update vehicle status from AVAILABLE to PENDING (waiting for payment)
    await this.vehicleStationService.changeStatus(createBookingDto.vehicle_at_station_id, { status: StatusVehicleAtStation.PENDING });

    // Step 7: Create fee records
    const rentalFeeRecord: CreateFeeDto = {
      booking_id: newBooking._id.toString(),
      amount: vehicleAtStationData.rental_fee_amount,
      type: FeeType.RENTAL_FEE,
      description: `Rental fee for ${vehicleAtStationData.rental_days} days`,
      currency: "VND",
    };
    await this.feeService.create(rentalFeeRecord);

    // Step 7: Create deposit fee record
    const depositFeeRecord: CreateFeeDto = {
      booking_id: newBooking._id.toString(),
      amount: vehicleAtStationData.deposit_fee_amount,
      type: FeeType.DEPOSIT_FEE,
      description: `Deposit fee for booking`,
      currency: "VND",
    };
    await this.feeService.create(depositFeeRecord);

    // Step 8: Create payment record with PENDING status
    const paymentRecord: CreatePaymentDto = {
      booking_id: newBooking._id.toString(),
      method: createBookingDto.payment_method,
      amount_paid: vehicleAtStationData.total_booking_fee_amount,
      transaction_code: paymentCode.orderId,
    };
    await this.paymentService.create(paymentRecord);

    // Step 9: Return payment URL
    return ResponseDetail.ok({ payUrl: paymentCode.payUrl });
  }
  async confirmBooking(id: string, user: StaffJwtUserPayload, changeStatus: ChangeStatusBookingDto): Promise<ResponseDetail<Booking>> {
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

    return ResponseDetail.ok(booking);
  }

  async getAllBookings(filters: BookingPaginationDto): Promise<ResponseList<Booking>> {
    const pipeline: any[] = [];
    const currentDate = new Date();
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
          as: "verified_by_staff",
        },
      },
      {
        $unwind: { path: "$verified_by_staff", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "verified_by_staff.user_id",
          foreignField: "_id",
          as: "verified_by_staff.user",
        },
      },
      {
        $unwind: { path: "$verified_by_staff.user", preserveNullAndEmptyArrays: true },
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
        $lookup: {
          from: "fees",
          localField: "_id",
          foreignField: "booking_id",
          as: "fees",
        },
      },
      {
        $lookup: {
          from: "vehicle_at_station",
          localField: "vehicle_at_station_id",
          foreignField: "_id",
          as: "vehicle_at_station",
          pipeline: [
            {
              $lookup: {
                from: "vehicles",
                localField: "vehicle_id",
                foreignField: "_id",
                as: "vehicle",
              },
            },
            {
              $addFields: {
                vehicle: { $arrayElemAt: ["$vehicle", 0] },
              },
            },

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
              $lookup: {
                from: "pricings",
                localField: "vehicle_id",
                foreignField: "vehicle_id",
                as: "pricing_all",
              },
            },
            {
              $addFields: {
                pricing: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$pricing_all",
                        as: "price",
                        cond: {
                          $and: [
                            { $lte: ["$$price.effective_from", currentDate] },
                            {
                              $or: [{ $eq: ["$$price.effective_to", null] }, { $gte: ["$$price.effective_to", currentDate] }],
                            },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
            {
              $project: { pricing_all: 0 },
            },
          ],
        },
      },
    );
    applyCommonFiltersMongo(pipeline, filters, BookingFieldMapping);
    const allowedSortFields = ["total_booking_fee_amount", "create_at", "status"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "created_at");
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);
    const result = (await this.bookingRepository.aggregate(pipeline)) as FacetResult<Booking>;
    const data = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;

    return ResponseList.ok(buildPaginationResponse(data, { total, page: filters.page, take: filters.take }));
  }
  async getBookingById(id: string): Promise<ResponseDetail<Booking | null>> {
    const pipeline: any[] = [];
    const currentDate = new Date();
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
          as: "verified_by_staff",
        },
      },
      {
        $unwind: { path: "$verified_by_staff", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "verified_by_staff.user_id",
          foreignField: "_id",
          as: "verified_by_staff.user",
        },
      },
      {
        $unwind: { path: "$verified_by_staff.user", preserveNullAndEmptyArrays: true },
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
        $lookup: {
          from: "fees",
          localField: "_id",
          foreignField: "booking_id",
          as: "fees",
        },
      },
      {
        $lookup: {
          from: "vehicle_at_station",
          localField: "vehicle_at_station_id",
          foreignField: "_id",
          as: "vehicle_at_station",
          pipeline: [
            {
              $lookup: {
                from: "vehicles",
                localField: "vehicle_id",
                foreignField: "_id",
                as: "vehicle",
              },
            },
            {
              $addFields: {
                vehicle: { $arrayElemAt: ["$vehicle", 0] },
              },
            },

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
              $lookup: {
                from: "pricings",
                localField: "vehicle_id",
                foreignField: "vehicle_id",
                as: "pricing_all",
              },
            },
            {
              $addFields: {
                pricing: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$pricing_all",
                        as: "price",
                        cond: {
                          $and: [
                            { $lte: ["$$price.effective_from", currentDate] },
                            {
                              $or: [{ $eq: ["$$price.effective_to", null] }, { $gte: ["$$price.effective_to", currentDate] }],
                            },
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
            {
              $project: { pricing_all: 0 },
            },
          ],
        },
      },
    );
    const result = await this.bookingRepository.aggregate(pipeline);
    const booking = result[0] as Booking;

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return ResponseDetail.ok(booking);
  }
}
