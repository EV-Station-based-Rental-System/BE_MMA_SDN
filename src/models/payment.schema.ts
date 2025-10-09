import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PaymentMethod, PaymentStatus } from 'src/common/enums/payment.enum';

export type PaymentDocument = HydratedDocument<Payment>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Payment {
  @Prop({ required: true, enum: PaymentMethod, type: String })
  method: PaymentMethod;

  @Prop({ required: true, enum: PaymentStatus, type: String })
  status: PaymentStatus;

  @Prop({ required: true, type: Number })
  amount_paid: number;

  @Prop({ required: true, type: Date })
  paid_at: Date;

  @Prop({ required: true, type: String })
  provider_reference: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
