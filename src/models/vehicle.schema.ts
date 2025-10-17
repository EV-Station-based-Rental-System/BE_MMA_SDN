import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiSchema } from "@nestjs/swagger";
import { HydratedDocument } from "mongoose";

export type VehicleDocument = HydratedDocument<Vehicle>;

@ApiSchema({
  name: "Vehicle",
})
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Vehicle {
  @Prop({ required: true, type: String, trim: true })
  make: string;

  @Prop({ required: true, type: String, trim: true })
  model: string;

  @Prop({ required: true, type: Number, min: 1900 })
  model_year: number;

  @Prop({ required: true, type: String, default: "EV", trim: true })
  category: string;

  @Prop({ type: Number })
  battery_capacity_kwh?: number;

  @Prop({ type: Number })
  range_km?: number;

  @Prop({ type: String, unique: true, sparse: true, trim: true })
  vin_number?: string;

  @Prop({ type: String, trim: true })
  img_url?: string;

  @Prop({ type: Boolean, default: true })
  is_active: boolean;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
