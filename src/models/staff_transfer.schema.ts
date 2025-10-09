import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { StaffTransferStatus } from 'src/common/enums/staff_trasfer.enum';

export type StaffTransferDocument = HydratedDocument<StaffTransfer>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class StaffTransfer {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true,
    unique: true,
  })
  staff_transfer_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true, index: true })
  staff_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true })
  from_station_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true })
  to_station_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' })
  approved_by_admin_id?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true })
  created_by_admin_id: mongoose.Types.ObjectId;

  @Prop({ type: Date, required: true, default: Date.now })
  created_at: Date;

  @Prop({ type: Date })
  approved_at?: Date;

  @Prop({ type: Date, required: true })
  effective_from: Date;

  @Prop({
    type: String,
    enum: Object.values(StaffTransferStatus),
    default: StaffTransferStatus.DRAFT,
    required: true,
  })
  status: StaffTransferStatus;

  @Prop({ type: String })
  notes?: string;
}

export const StaffTransferSchema = SchemaFactory.createForClass(StaffTransfer);

StaffTransferSchema.index({ staff_transfer_id: 1 }, { unique: true });
StaffTransferSchema.index({ staff_id: 1 });
StaffTransferSchema.index({ status: 1, to_station_id: 1 });
