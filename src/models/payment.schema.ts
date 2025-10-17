import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { PaymentMethod, PaymentStatus } from "src/common/enums/payment.enum";

export type PaymentDocument = HydratedDocument<Payment>;
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Payment {
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
    default: PaymentStatus.PAID,
  })
  status: PaymentStatus;

  @Prop({ required: true, type: Number })
  amount_paid: number;

  @Prop({ type: String })
  transaction_code?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
