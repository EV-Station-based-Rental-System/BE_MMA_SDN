import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { BookingStatus, BookingVerificationStatus } from "src/common/enums/booking.enum";

export type BookingDocument = mongoose.HydratedDocument<Booking>;
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Booking {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Renter", required: true, index: true })
  renter_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "VehicleAtStation", required: true, index: true })
  vehicle_at_station_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Date, default: Date.now })
  booking_created_at: Date;

  @Prop({ type: Date })
  expected_return_datetime?: Date;

  @Prop({
    required: true,
    enum: Object.values(BookingStatus),
    default: BookingStatus.PENDING_VERIFICATION,
    type: String,
  })
  status: BookingStatus;

  @Prop({
    required: true,
    enum: Object.values(BookingVerificationStatus),
    default: BookingVerificationStatus.PENDING,
    type: String,
  })
  verification_status: BookingVerificationStatus;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Staff", index: true })
  verified_by_staff_id?: mongoose.Types.ObjectId;

  @Prop({ type: Date })
  verified_at: Date;

  @Prop({ type: String })
  cancel_reason: string;
}
export const BookingSchema = SchemaFactory.createForClass(Booking);
