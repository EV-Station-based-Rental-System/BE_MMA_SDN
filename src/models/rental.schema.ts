import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Booking } from './booking.schema';
import { Vehicle } from './vehicle.schema';
import { RetalStatus } from 'src/common/enums/retal.enum';

export type RentalDocument = HydratedDocument<Rental>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Rental {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true })
  booking_id: Booking;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' })
  vehicle_id: Vehicle;

  @Prop({ required: true, type: Date })
  pickup_date: Date;

  @Prop({ required: true, type: Date })
  expected_return_datetime: Date;

  @Prop({ type: Date })
  actual_return_datetime: Date;

  @Prop({ required: true, enum: RetalStatus, type: String })
  status: RetalStatus;

  @Prop({ type: Number, default: 0 })
  score: number;

  @Prop({ type: String })
  comment: string;

  @Prop({ required: true, type: Date, default: Date.now })
  rated_at: Date;
}
export const RentalSchema = SchemaFactory.createForClass(Rental);
