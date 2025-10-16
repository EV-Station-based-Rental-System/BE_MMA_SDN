import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { RentalStatus } from "src/common/enums/rental.enum";

export type RentalDocument = HydratedDocument<Rental>;
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Rental {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true })
  booking_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", index: true })
  vehicle_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Date })
  pickup_datetime: Date;

  @Prop({ type: Date })
  expected_return_datetime?: Date;

  @Prop({ type: Date })
  actual_return_datetime: Date;

  @Prop({
    required: true,
    enum: Object.values(RentalStatus),
    type: String,
    default: RentalStatus.RESERVED,
  })
  status: RentalStatus;

  @Prop({ type: Number, default: null })
  score: number | null;

  @Prop({ type: String })
  comment: string;

  @Prop({ required: false, type: Date })
  rated_at?: Date;
}
export const RentalSchema = SchemaFactory.createForClass(Rental);
