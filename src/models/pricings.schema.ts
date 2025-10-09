import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PricingDocument = HydratedDocument<Pricing>;
import mongoose, { HydratedDocument } from 'mongoose';
import { Vehicle } from './vehicle.schema';
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Pricing {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true })
  vehicle_id: Vehicle;

  @Prop({ required: true, type: Number })
  price_per_hour: number;

  @Prop({ required: true, type: Number })
  price_per_day: number;

  @Prop({ required: false, type: Date })
  effective_from: Date;

  @Prop({ required: false, type: Date })
  effective_to: Date;

  @Prop({ required: true, type: Number, default: 0 })
  deposit_amount: number;

  @Prop({ required: false, type: Number })
  late_return_fee_per_hour: number;

  @Prop({ required: false, type: Number })
  mileage_limit_per_day: number;

  @Prop({ required: false, type: Number })
  excess_mileage_fee: number;
}
export const PricingSchema = SchemaFactory.createForClass(Pricing);
