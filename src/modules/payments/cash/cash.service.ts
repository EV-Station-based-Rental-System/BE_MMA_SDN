import { Injectable, Inject, forwardRef } from "@nestjs/common";

import { AbstractPaymentService } from "../base/abstract-payment.service";
import { InjectModel } from "@nestjs/mongoose";
import { Payment } from "src/models/payment.schema";
import { Booking } from "src/models/booking.schema";
import { VehicleAtStation } from "src/models/vehicle_at_station.schema";
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
import { BookingVerificationStatus } from "src/common/enums/booking.enum";

@Injectable()
export class CashService extends AbstractPaymentService {
  constructor(
    @InjectModel(VehicleAtStation.name) vehicleAtStationRepository: Model<VehicleAtStation>,
    @InjectModel(Payment.name) paymentRepository: Model<Payment>,
    @InjectModel(Booking.name) bookingRepository: Model<Booking>,
    @InjectModel(Renter.name) renterRepository: Model<Renter>,
    @InjectModel(User.name) userRepository: Model<User>,
    @Inject(MailService) emailService: MailService,

    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
  ) {
    super(vehicleAtStationRepository, paymentRepository, bookingRepository, renterRepository, userRepository, emailService);
  }
  create() {
    return { orderId: `CASH_${Date.now()}`, payUrl: "Payment Cash Success waiting for confirmation from staff" };
  }

  async confirmPaymentByCash(paymentId: string, user: StaffJwtUserPayload): Promise<ResponseMsg> {
    // Get payment by transaction code (orderId)
    const payment = await this.getPaymentById(paymentId);
    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException("Payment already processed");
    }

    // confirm booking
    const booking = await this.bookingRepository.findById(payment.booking_id);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    // Tạo changeStatus cho cash
    const changeStatus = {
      verification_status: BookingVerificationStatus.APPROVED,
      cancel_reason: undefined,
    };

    await this.bookingService.confirmBooking(booking._id.toString(), user, changeStatus);
    // Update payment status to SUCCESS
    await this.handleReturnSuccess(payment);
    return ResponseMsg.ok("Cash payment confirmed successfully");
  }
}
