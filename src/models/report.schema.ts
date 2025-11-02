import { Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Report {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Inspection", index: true })
  inspection_id: mongoose.Types.ObjectId;

  @Prop({ type: String })
  damage_notes?: string;

  @Prop({ required: true, type: Boolean, default: false })
  damage_found: boolean;

  @Prop({ type: Number, default: 0 })
  damage_price: number;
}
export const ReportSchema = SchemaFactory.createForClass(Report);
