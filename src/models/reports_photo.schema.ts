import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({
  collection: "reports_photo",
  timestamps: { createdAt: "created_at", updatedAt: false },
})
export class ReportsPhoto {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Report" })
  report_id?: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Inspection" })
  inspection_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: String })
  url: string;

  @Prop({ type: String })
  label?: string;
}

export const ReportsPhotoSchema = SchemaFactory.createForClass(ReportsPhoto);
