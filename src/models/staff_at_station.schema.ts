import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type StaffAtStationDocument = HydratedDocument<StaffAtStation>;

@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class StaffAtStation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true })
  staff_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true })
  station_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Date, default: Date.now })
  start_time: Date;

  @Prop({ type: Date })
  end_time?: Date;

  @Prop({ type: String })
  role_at_station?: string;
}

export const StaffAtStationSchema = SchemaFactory.createForClass(StaffAtStation);
