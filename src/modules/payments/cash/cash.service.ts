import { Injectable, Inject, forwardRef } from "@nestjs/common";

import { AbstractPaymentService } from "../base/abstract-payment.service";
import { InjectModel } from "@nestjs/mongoose";
import { Payment } from "src/models/payment.schema";
import { Booking } from "src/models/booking.schema";
import { Vehicle } from "src/models/vehicle.schema";
import { Renter } from "src/models/renter.schema";
import { User } from "src/models/user.schema";
import { MailService } from "src/common/mail/mail.service";
import { Model } from "mongoose";
import { PaymentStatus } from "src/common/enums/payment.enum";
import { ConflictException } from "src/common/exceptions/conflict.exception";
import { ResponseMsg } from "src/common/response/response-message";
import { BookingService } from "src/modules/bookings/booking.service";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { StaffJwtUserPayload } from "src/common/utils/type";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CashService extends AbstractPaymentService {
  constructor(
    @InjectModel(Vehicle.name) vehicleRepository: Model<Vehicle>,
    @InjectModel(Payment.name) paymentRepository: Model<Payment>,
    @InjectModel(Booking.name) bookingRepository: Model<Booking>,
    @InjectModel(Renter.name) renterRepository: Model<Renter>,
    @InjectModel(User.name) userRepository: Model<User>,

    emailService: MailService,
    configService: ConfigService,

    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
  ) {
    super(vehicleRepository, paymentRepository, bookingRepository, renterRepository, userRepository, configService, emailService);
  }
  create() {
    return { orderId: `CASH_${Date.now()}`, payUrl: "Payment Cash Success waiting for confirmation from staff" };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async confirmPaymentByCash(paymentId: string, _user: StaffJwtUserPayload): Promise<ResponseMsg> {
    // Get payment by transaction code (orderId)
    const payment = await this.getPaymentById(paymentId);
    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException("Payment already processed");
    }

    // Validate payment has transaction_code
    if (!payment.transaction_code) {
      throw new NotFoundException("Payment transaction code not found");
    }

    // confirm booking
    const booking = await this.bookingRepository.findById(payment.booking_id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    // Ensure booking has proper _id type
    if (!booking._id) {
      throw new NotFoundException("Booking ID not found");
    }

    // Update payment status to PAID and booking status to VERIFIED
    // Staff will still need to approve the booking separately via confirmBooking endpoint
    await this.handleReturnSuccess(payment);

    return ResponseMsg.ok("Cash payment confirmed successfully. Booking is now VERIFIED and awaiting staff approval.");
  }
}
