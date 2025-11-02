import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Payment } from "src/models/payment.schema";
import { CreatePaymentDto } from "./dto/createPayment.dto";
import { ResponseMsg } from "src/common/response/response-message";
import { NotFoundException } from "src/common/exceptions/not-found.exception";

@Injectable()
export class PaymentService {
  constructor(@InjectModel(Payment.name) private paymentModel: Model<Payment>) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const createdPayment = new this.paymentModel(createPaymentDto);
    return createdPayment.save();
  }
  async changeStatus(paymentId: string, status: string): Promise<ResponseMsg> {
    const updatedPayment = await this.paymentModel.findByIdAndUpdate(paymentId, { status }, { new: true });
    if (!updatedPayment) {
      throw new NotFoundException("Payment not found");
    }
    return ResponseMsg.ok("Payment status updated successfully");
  }
}
