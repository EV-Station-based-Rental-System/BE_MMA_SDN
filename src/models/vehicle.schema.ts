import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiSchema } from "@nestjs/swagger";
import mongoose from "mongoose";
import { VehicleStatus } from "src/common/enums/vehicle.enum";

@ApiSchema({
  name: "Vehicle",
})
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Vehicle {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Station", index: true })
  station_id?: mongoose.Types.ObjectId;

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

  @Prop({ required: true, type: String, unique: true, trim: true, uppercase: true })
  license_plate: string;

  @Prop({ type: String, trim: true })
  img_url?: string;

  @Prop({ type: Boolean, default: true })
  is_active: boolean;

  @Prop({ type: Number })
  current_battery_capacity_kwh?: number;

  @Prop({ type: Number })
  current_mileage?: number;

  @Prop({ type: String, enum: Object.values(VehicleStatus), default: VehicleStatus.AVAILABLE })
  status: VehicleStatus;

  @Prop({ required: true, type: Number })
  price_per_hour: number;

  @Prop({ type: Number })
  price_per_day?: number;

  @Prop({ required: true, type: Number, default: 0 })
  deposit_amount: number;

  @Prop({ type: String })
  image_kit_file_id?: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
