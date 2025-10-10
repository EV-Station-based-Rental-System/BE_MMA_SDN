import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type VehicleDocument = HydratedDocument<Vehicle>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Vehicle {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true,
    unique: true,
  })
  vehicle_id: mongoose.Types.ObjectId;

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
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);


