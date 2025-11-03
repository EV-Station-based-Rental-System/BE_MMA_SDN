import { InternalServerErrorException } from "@nestjs/common/exceptions/internal-server-error.exception";
import { AbstractPaymentService } from "../base/abstract-payment.service";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import axios from "axios";
import { Vehicle } from "src/models/vehicle.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { MailService } from "src/common/mail/mail.service";
import { Booking } from "src/models/booking.schema";
import { Payment } from "src/models/payment.schema";
import { ForbiddenException } from "@nestjs/common/exceptions/forbidden.exception";
import { PaymentStatus } from "src/common/enums/payment.enum";
import { ConflictException } from "@nestjs/common";
import { Renter } from "src/models/renter.schema";
import { User } from "src/models/user.schema";
export class MomoService extends AbstractPaymentService {
  constructor(
    @InjectModel(Vehicle.name) vehicleRepository: Model<Vehicle>,
    @InjectModel(Payment.name) paymentRepository: Model<Payment>,
    @InjectModel(Booking.name) bookingRepository: Model<Booking>,
    @InjectModel(Renter.name) renterRepository: Model<Renter>,
    @InjectModel(User.name) userRepository: Model<User>,

    emailService: MailService,
    configService: ConfigService,
  ) {
    super(vehicleRepository, paymentRepository, bookingRepository, renterRepository, userRepository, configService, emailService);
  }

  async create(total: string): Promise<{ orderId: string; payUrl: string }> {
    const accessKey = this.configService.get<string>("momo.accessKey");
    const secretKey = this.configService.get<string>("momo.secretKey");
    const partnerCode = this.configService.get<string>("momo.partnerCode");
    const redirectUrl = this.configService.get<string>("momo.redirectUrl");
    const ipnUrl = this.configService.get<string>("momo.ipnUrl");
    if (!accessKey || !secretKey || !partnerCode || !redirectUrl || !ipnUrl) {
      throw new InternalServerErrorException("Momo configuration is missing");
    }

    const requestId = partnerCode + new Date().getTime();
    const orderId = requestId;
    const orderInfo = "Momo payment";
    const requestType = "captureWallet";
    const extraData = "";
    const autoCapture = true;
    const amount = parseInt(total);
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    const requestBody = {
      partnerCode,
      partnerName: "CINEMA",
      storeId: "MyStore",
      requestId,
      amount: amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      requestType,
      autoCapture,
      extraData,
      orderGroupId: "",
      signature,
    };

    try {
      const result = await axios.post(this.configService.get<string>("momo.requestCreate") || "", requestBody, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      });
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        orderId: result.data.orderId as string,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        payUrl: result.data.deeplink as string,
      };
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new InternalServerErrorException("Failed to create Momo payment: " + (error?.response?.data || error?.message));
    }
  }
  async handleReturn(query: { [key: string]: string }) {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = query;

    const accessKey = this.configService.get<string>("momo.accessKey");
    const secretKey = this.configService.get<string>("momo.secretKey");
    if (!accessKey || !secretKey) {
      throw new InternalServerErrorException("Momo configuration is missing");
    }

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const computedSignature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    if (computedSignature !== signature) {
      throw new ForbiddenException("Invalid MoMo signature");
    }

    // Get payment by transaction code (orderId)
    const payment = await this.getPaymentByTransactionCode(orderId);

    // Check if payment already paid
    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException("Payment already processed");
    }

    if (Number(resultCode) === 0) {
      // Payment success
      return this.handleReturnSuccess(payment);
    } else {
      // Payment failed
      return this.handleReturnFail();
    }
  }
}
