import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Renter } from './renter.schema';
import { VehicleAtStation } from './vehicle_at_station.schema';
import { StatusBooking, VerificationStatus } from 'src/common/enums/statusBooking.enum';
import { Staff } from './staff.schema';

export type BookingDocument = mongoose.HydratedDocument<Booking>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Booking {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Renter', required: true })
  renter_id: Renter;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'VehicleAtStation', required: true })
  vehicle_at_station_id: VehicleAtStation;

  @Prop({ required: true, type: Date })
  booking_create_at: Date;

  @Prop({ required: true, type: Date })
  expected_return_datetime: Date;

  @Prop({ required: true, enum: StatusBooking, default: StatusBooking.PENDING_VERIFICATION })
  status: StatusBooking;

  @Prop({ required: true, enum: VerificationStatus, default: VerificationStatus.PENDING })
  verification_status: VerificationStatus;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  verified_by_staff_id: Staff;

  @Prop({ type: Date })
  verified_at: Date;

  @Prop({ type: String })
  cancel_reason: string;
}
export const BookingSchema = SchemaFactory.createForClass(Booking);
