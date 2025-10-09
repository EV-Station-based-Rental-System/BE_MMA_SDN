import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { RetalStatus } from 'src/common/enums/retal.enum';

export type RentalDocument = HydratedDocument<Rental>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Rental {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true,
    unique: true,
  })
  rental_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true })
  booking_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', index: true })
  vehicle_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Date })
  pickup_datetime: Date;

  @Prop({ type: Date })
  expected_return_datetime?: Date;

  @Prop({ type: Date })
  actual_return_datetime: Date;

  @Prop({
    required: true,
    enum: Object.values(RetalStatus),
    type: String,
    default: RetalStatus.RESERVED,
  })
  status: RetalStatus;

  @Prop({ required: true, type: Number, default: null })
  score: number | null;

  @Prop({ type: String })
  comment: string;

  @Prop({ required: true, type: Date, default: Date.now })
  rated_at: Date;
}
export const RentalSchema = SchemaFactory.createForClass(Rental);

RentalSchema.index({ rental_id: 1 }, { unique: true });
RentalSchema.index({ booking_id: 1 }, { unique: true });
RentalSchema.index({ vehicle_id: 1 });
