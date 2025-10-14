import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type PricingDocument = HydratedDocument<Pricing>;

@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Pricing {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true })
  vehicle_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.Decimal128 })
  price_per_hour: mongoose.Types.Decimal128;

  @Prop({ type: mongoose.Schema.Types.Decimal128 })
  price_per_day?: mongoose.Types.Decimal128;

  @Prop({ required: true, type: Date })
  effective_from: Date;

  @Prop({ type: Date })
  effective_to?: Date;

  @Prop({ required: true, type: mongoose.Schema.Types.Decimal128, default: 0 })
  deposit_amount: mongoose.Types.Decimal128;

  @Prop({ type: mongoose.Schema.Types.Decimal128 })
  late_return_fee_per_hour?: mongoose.Types.Decimal128;

  @Prop({ type: Number })
  mileage_limit_per_day?: number;

  @Prop({ type: mongoose.Schema.Types.Decimal128 })
  excess_mileage_fee?: mongoose.Types.Decimal128;
}
export const PricingSchema = SchemaFactory.createForClass(Pricing);
