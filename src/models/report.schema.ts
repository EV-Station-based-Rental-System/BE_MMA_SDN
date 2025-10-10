import { Schema } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Prop, SchemaFactory } from "@nestjs/mongoose";

export type ReportDocument = HydratedDocument<Report>;
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Report {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true,
    unique: true,
  })
  report_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Inspection", index: true })
  inspection_id: mongoose.Types.ObjectId;

  @Prop({ type: String })
  notes?: string;

  @Prop({ required: true, type: Boolean, default: false })
  damage_found: boolean;
}
export const ReportSchema = SchemaFactory.createForClass(Report);
