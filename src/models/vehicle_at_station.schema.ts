import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Vehicle } from './vehicle.schema';

import { Station } from './station.schema';
import { StatusVehicleAtStation } from 'src/common/enums/statusVehicleAtStation.enum';

export type VehicleAtStationDocument = mongoose.HydratedDocument<VehicleAtStation>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class VehicleAtStation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true })
  vehicle_id: Vehicle;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true })
  station_id: Station;

  @Prop({ required: true, type: Date })
  start_time: Date;

  @Prop({ required: true, type: Date })
  end_time: Date;

  @Prop({ required: true, type: Number })
  current_battery_capacity_kwh: number;

  @Prop({ required: true, type: Number })
  current_mileage: number;

  @Prop({ required: true, type: String, enum: StatusVehicleAtStation })
  status: StatusVehicleAtStation;
}

export const VehicleAtStationSchema = SchemaFactory.createForClass(VehicleAtStation);
