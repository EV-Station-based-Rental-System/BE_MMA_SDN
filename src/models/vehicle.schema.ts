import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VehicleDocument = HydratedDocument<Vehicle>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Vehicle {
  @Prop({ required: true, type: String })
  make: string;

  @Prop({ required: true, type: String })
  model: string;

  @Prop({ required: true, type: Number })
  model_year: number;

  @Prop({ required: true, type: String, default: 'EV' })
  category: string;

  @Prop({ type: Number })
  battery_capacity_kwh?: number;

  @Prop({ type: Number })
  range_km?: number;

  @Prop({ type: String, unique: true })
  vin_number?: string;

  @Prop({ type: String })
  img_url?: string;

  @Prop({ type: Boolean, default: true })
  is_active: boolean;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
