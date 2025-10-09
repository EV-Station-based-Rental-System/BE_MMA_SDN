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

  @Prop({ required: true, type: String })
  category: string;

  @Prop({ required: true, type: Number })
  battery_capacity_kwh: number;

  @Prop({ required: true, type: Number })
  range_km: number;

  @Prop({ required: true, type: String, unique: true })
  vin_number: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
