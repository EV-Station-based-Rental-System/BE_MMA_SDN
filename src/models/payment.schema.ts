import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { PaymentMethod, PaymentStatus } from "src/common/enums/payment.enum";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Payment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true })
  booking_id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(PaymentMethod),
    type: String,
    default: PaymentMethod.UNKNOWN,
  })
  method: PaymentMethod;

  @Prop({
    required: true,
    enum: Object.values(PaymentStatus),
    type: String,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Prop({ required: true, type: Number })
  amount_paid: number;

  @Prop({ type: String })
  transaction_code?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
