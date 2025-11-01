import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: { createdAt: false, updatedAt: false } })
export class Pricing {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true })
  vehicle_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Number })
  price_per_hour: number;

  @Prop({ type: Number })
  price_per_day?: number;

  @Prop({ required: true, type: Date })
  effective_from: Date;

  @Prop({ type: Date })
  effective_to?: Date;

  @Prop({ required: true, type: Number, default: 0 })
  deposit_amount: number;

  @Prop({ type: Number })
  late_return_fee_per_hour?: number;

  @Prop({ type: Number })
  mileage_limit_per_day?: number;

  @Prop({ type: Number })
  excess_mileage_fee?: number;
}
export const PricingSchema = SchemaFactory.createForClass(Pricing);
