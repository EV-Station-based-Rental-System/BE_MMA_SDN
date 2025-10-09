import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Station } from './station.schema';
import { Staff } from './staff.schema';

export type StaffAtStationDocument = HydratedDocument<StaffAtStation>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class StaffAtStation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true })
  staff_id: Staff;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true })
  station_id: Station;

  @Prop({ required: true, type: Date })
  start_time: Date;

  @Prop({ type: Date })
  end_time: Date;

  @Prop({ required: true, type: String })
  role_at_station: string;
}

export const StaffAtStationSchema = SchemaFactory.createForClass(StaffAtStation);
