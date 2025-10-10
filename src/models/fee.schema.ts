import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { FeeType } from 'src/common/enums/fee.enum';

export type FeeDocument = mongoose.HydratedDocument<Fee>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Fee {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true,
    unique: true,
  })
  fee_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true })
  booking_id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(FeeType),
    default: FeeType.DEPOSIT,
    type: String,
  })
  type: FeeType;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: mongoose.Schema.Types.Decimal128 })
  amount: mongoose.Types.Decimal128;

  @Prop({ required: true, type: String, default: 'USD' })
  currency: string;
}
export const feeSchema = SchemaFactory.createForClass(Fee);
