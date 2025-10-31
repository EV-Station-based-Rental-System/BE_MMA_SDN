import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Staff {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true })
  user_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true })
  station_id: mongoose.Types.ObjectId;

  @Prop({ required: true, unique: true, type: String })
  employee_code: string;

  @Prop({ required: true, type: String })
  position: string;

  @Prop({ required: true, type: Date, default: Date.now })
  hire_date: Date;
}
export const StaffSchema = SchemaFactory.createForClass(Staff);
