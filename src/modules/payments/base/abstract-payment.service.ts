import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { PaymentStatus } from "src/common/enums/payment.enum";
import { VehicleStatus } from "src/common/enums/vehicle.enum";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { MailService } from "src/common/mail/mail.service";
import { Booking } from "src/models/booking.schema";
import { Payment } from "src/models/payment.schema";
import { Vehicle } from "src/models/vehicle.schema";
import { BookingStatus } from "src/common/enums/booking.enum";
import { Renter } from "src/models/renter.schema";
import { User } from "src/models/user.schema";
import { InternalServerErrorException } from "src/common/exceptions/internal-server-error.exception";

export abstract class AbstractPaymentService {
  constructor(
    @InjectModel(Vehicle.name) protected readonly vehicleRepository: Model<Vehicle>,
    @InjectModel(Payment.name) protected readonly paymentRepository: Model<Payment>,
    @InjectModel(Booking.name) protected readonly bookingRepository: Model<Booking>,
    @InjectModel(Renter.name) protected readonly renterRepository: Model<Renter>,
    @InjectModel(User.name) protected readonly userRepository: Model<User>,

    protected readonly emailService: MailService,
  ) {}

  async getPaymentById(paymentId: string): Promise<Payment & { _id: mongoose.Types.ObjectId }> {
    const payment = await this.paymentRepository
      .findById(paymentId)
      .populate({
        path: "booking_id",
        populate: {
          path: "renter_id",
          populate: {
            path: "user_id",
          },
        },
      })
      .lean()
      .exec();
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }
    return payment as Payment & { _id: mongoose.Types.ObjectId };
  }
  async getPaymentByTransactionCode(transactionCode: string) {
    const payment = await this.paymentRepository
      .findOne({ transaction_code: transactionCode })
      .populate({
        path: "booking_id",
        populate: {
          path: "renter_id",
          populate: {
            path: "user_id",
          },
        },
      })
      .lean()
      .exec();

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    // Type assertion for populated fields - using 'unknown' first as recommended
    return payment as unknown as Payment & {
      _id: mongoose.Types.ObjectId;
      booking_id: Booking & {
        _id: mongoose.Types.ObjectId;
        renter_id: Renter & {
          _id: mongoose.Types.ObjectId;
          user_id: User & { _id: mongoose.Types.ObjectId };
        };
      };
    };
  }

  async getBookingById(bookingId: string): Promise<Booking & { _id: mongoose.Types.ObjectId }> {
    const booking = await this.bookingRepository.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return booking as Booking & { _id: mongoose.Types.ObjectId };
  }

  async changeStatusVehicleToBooked(vehicleId: string): Promise<void> {
    await this.vehicleRepository.findByIdAndUpdate(vehicleId, {
      status: VehicleStatus.BOOKED,
    });
  }

  async changeStatusPaymentToPaid(transaction_code: string): Promise<void> {
    const findPayment = await this.paymentRepository.findOne({ transaction_code: transaction_code || "" });
    if (!findPayment) {
      throw new NotFoundException("Payment not found");
    }
    await this.paymentRepository.findByIdAndUpdate(findPayment._id.toString(), {
      status: PaymentStatus.PAID,
    });
  }

  async changeStatusBookingToVerified(bookingId: string): Promise<void> {
    await this.bookingRepository.findByIdAndUpdate(bookingId, {
      status: BookingStatus.VERIFIED,
    });
  }

  async handleReturnSuccess(payment: Payment): Promise<void> {
    // 1. Update payment status to PAID
    await this.changeStatusPaymentToPaid(payment.transaction_code || "");

    // 2. Get booking info with populated data
    const paymentWithDetails = await this.getPaymentByTransactionCode(payment.transaction_code || "");

    const booking = paymentWithDetails.booking_id;

    if (!booking) {
      throw new NotFoundException("Booking not found in payment");
    }

    // Validate vehicle_id exists
    if (!booking.vehicle_id) {
      throw new NotFoundException("Vehicle ID not found in booking");
    }

    // 3. Update booking status to VERIFIED (payment confirmed)
    await this.changeStatusBookingToVerified(booking._id.toString());

    // 4. Update vehicle status to BOOKED
    await this.changeStatusVehicleToBooked(booking.vehicle_id.toString());

    // 5. Send confirmation email (don't fail the entire flow if email fails)
    try {
      await this.handleSendEmail(paymentWithDetails, booking);
    } catch (error: any) {
      throw new InternalServerErrorException("Failed to send confirmation email: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }

  async handleReturnFail(): Promise<void> {}

  async handleSendEmail(
    payment: Payment & {
      _id: mongoose.Types.ObjectId;
      booking_id: Booking & {
        _id: mongoose.Types.ObjectId;
        renter_id: Renter & {
          _id: mongoose.Types.ObjectId;
          user_id: User & { _id: mongoose.Types.ObjectId };
        };
      };
    },
    booking: Booking & {
      _id: mongoose.Types.ObjectId;
      renter_id: Renter & {
        _id: mongoose.Types.ObjectId;
        user_id: User & { _id: mongoose.Types.ObjectId };
      };
    },
  ): Promise<void> {
    // Get user email from populated data
    const renter = booking.renter_id;

    if (!renter) {
      throw new InternalServerErrorException("Renter not found in booking - populate failed");
    }

    const user = renter.user_id;

    if (!user) {
      throw new InternalServerErrorException("User not found in renter - populate failed");
    }

    if (!user.email) {
      throw new InternalServerErrorException("User email not found, cannot send email notification");
    }

    // Send email
    await this.emailService.sendBookingConfirmation({
      email: user.email,
      renterName: user.full_name,
      bookingId: booking._id.toString(),
      rentalStartDate: booking.rental_start_datetime,
      expectedReturnDate: booking.expected_return_datetime,
      totalAmount: booking.total_booking_fee_amount,
      rentalFee: booking.rental_fee_amount,
      depositFee: booking.deposit_fee_amount,
      transactionCode: payment.transaction_code,
    });
  }
}
