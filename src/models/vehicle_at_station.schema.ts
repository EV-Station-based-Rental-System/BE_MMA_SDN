import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { StatusVehicleAtStation } from "src/common/enums/vehicle_at_station.enum";

export type VehicleAtStationDocument = mongoose.HydratedDocument<VehicleAtStation>;
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class VehicleAtStation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true })
  vehicle_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true, index: true })
  station_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Date, default: Date.now })
  start_time: Date;

  @Prop({ type: Date })
  end_time?: Date;

  @Prop({ type: Number })
  current_battery_capacity_kwh?: number;

  @Prop({ required: true, type: Number })
  current_mileage: number;

  @Prop({ type: String, enum: Object.values(StatusVehicleAtStation) })
  status?: StatusVehicleAtStation;
}

export const VehicleAtStationSchema = SchemaFactory.createForClass(VehicleAtStation);
