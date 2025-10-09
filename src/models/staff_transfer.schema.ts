import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Admin } from './admin.schema';
import { Staff } from './staff.schema';
import { Station } from './station.schema';
import { StaffTransferStatus } from 'src/common/enums/staffTrasfer.enum';

export type StaffTransferDocument = HydratedDocument<StaffTransfer>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class StaffTransfer {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true })
  staff_id: Staff;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true })
  from_station_id: Station;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true })
  to_station_id: Station;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' })
  approved_by_admin_id: Admin;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true })
  created_by_admin_id: Admin;

  @Prop({ type: Date, required: true, default: Date.now })
  created_at: Date;

  @Prop({ type: Date })
  approved_at?: Date;

  @Prop({ type: Date, required: true })
  effective_from: Date;

  @Prop({ type: String, enum: StaffTransferStatus, default: StaffTransferStatus.DRAFT, required: true })
  status: StaffTransferStatus;

  @Prop({ type: String })
  notes?: string;
}

export const StaffTransferSchema = SchemaFactory.createForClass(StaffTransfer);
