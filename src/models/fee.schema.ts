import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { FeeType } from "src/common/enums/fee.enum";

export type FeeDocument = mongoose.HydratedDocument<Fee>;
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Fee {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true })
  booking_id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(FeeType),
    type: String,
  })
  type: FeeType;

  @Prop({ required: false, type: String })
  description?: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: String, default: "VND" })
  currency: string;
}
export const FeeSchema = SchemaFactory.createForClass(Fee);
