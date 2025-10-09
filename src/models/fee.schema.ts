import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Booking } from './booking.schema';
import { FeeType } from 'src/common/enums/fee.enum';

export type FeeDocument = mongoose.HydratedDocument<Fee>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Fee {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true })
  booking_id: Booking;

  @Prop({ required: true, enum: FeeType })
  type: FeeType;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: String })
  currency: string;
}
export const feeSchema = SchemaFactory.createForClass(Fee);
