import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { PaymentMethod, PaymentStatus } from 'src/common/enums/payment.enum';

export type PaymentDocument = HydratedDocument<Payment>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Payment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true,
    unique: true,
  })
  payment_id: mongoose.Types.ObjectId;

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

  @Prop({ required: true, type: mongoose.Schema.Types.Decimal128 })
  amount_paid: mongoose.Types.Decimal128;

  @Prop({ required: true, type: Date, default: Date.now })
  paid_at: Date;

  @Prop({ type: String })
  provider_reference?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
