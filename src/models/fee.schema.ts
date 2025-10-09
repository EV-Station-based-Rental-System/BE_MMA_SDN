import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Booking } from './booking.schema';
import { FeeType } from 'src/common/enums/fee.enum';

export type FeeDocument = mongoose.HydratedDocument<Fee>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Fee {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true })
  booking_id: Booking;

  @Prop({ required: true, enum: FeeType, default: FeeType.DEPOSIT, type: String })
  type: FeeType;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: mongoose.Schema.Types.Decimal128 })
  amount: mongoose.Types.Decimal128;

  @Prop({ required: true, type: String, default: 'USD' })
  currency: string;
}
export const feeSchema = SchemaFactory.createForClass(Fee);

feeSchema.index({ booking_id: 1 }, { unique: true, name: 'ux_fees_deposit_per_booking' });
