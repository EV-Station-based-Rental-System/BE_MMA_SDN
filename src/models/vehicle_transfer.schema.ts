import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { VehicleTransferStatus } from 'src/common/enums/vehicle_transfer.enum';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class VehicleTransfer {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', index: true })
  vehicle_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Station' })
  from_station_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Station' })
  to_station_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' })
  picked_up_by_staff_id?: mongoose.Types.ObjectId;

  @Prop({ required: false, type: Date })
  picked_up_at: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' })
  dropped_off_by_staff_id?: mongoose.Types.ObjectId;

  @Prop({ required: false, type: Date })
  dropped_off_at: Date;

  @Prop({ required: false, type: String })
  pickup_notes: string;

  @Prop({ required: false, type: String })
  dropoff_notes: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' })
  approved_by_admin_id?: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Admin' })
  created_by_admin_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date;

  @Prop({ required: false, type: Date })
  approved_at: Date;

  @Prop({ type: Date })
  scheduled_pickup_at?: Date;

  @Prop({ type: Date })
  scheduled_dropoff_at?: Date;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(VehicleTransferStatus),
    default: VehicleTransferStatus.DRAFT,
  })
  status: VehicleTransferStatus;

  @Prop({ required: false, type: String })
  notes: string;
}

export const VehicleTransferSchema = SchemaFactory.createForClass(VehicleTransfer);
