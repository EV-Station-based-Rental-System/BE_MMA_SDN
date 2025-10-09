import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Vehicle } from './vehicle.schema';
import { Station } from './station.schema';
import { VehicleTransferStatus } from 'src/common/enums/vehicle_transfer.enum';
import mongoose from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class VehicleTransfer {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' })
  vehicle_id: Vehicle;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Station' })
  from_station_id: Station;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Station' })
  to_station_id: Station;

  @Prop({ required: false, type: Number })
  picked_up_by_staff_id: number;

  @Prop({ required: false, type: Date })
  picked_up_at: Date;

  @Prop({ required: false, type: Number })
  dropped_off_by_staff_id: number;

  @Prop({ required: false, type: Date })
  dropped_off_at: Date;

  @Prop({ required: false, type: String })
  pickup_notes: string;

  @Prop({ required: false, type: String })
  dropoff_notes: string;

  @Prop({ required: false, type: String })
  approved_by_admin_id: string;

  @Prop({ required: true, type: String })
  created_by_admin_id: string;

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date;

  @Prop({ required: false, type: Date })
  approved_at: Date;

  @Prop({ required: true, type: Date })
  scheduled_pickup_at: Date;

  @Prop({ required: true, type: Date })
  scheduled_dropoff_at: Date;

  @Prop({ required: true, type: String, enum: VehicleTransferStatus, default: VehicleTransferStatus.DRAFT })
  status: VehicleTransferStatus;

  @Prop({ required: false, type: String })
  notes: string;
}

export const VehicleTransferSchema = SchemaFactory.createForClass(VehicleTransfer);
