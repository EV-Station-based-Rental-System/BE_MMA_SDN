import { Schema } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Inspection } from './inspections.schema';

export type ReportDocument = HydratedDocument<Report>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Report {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Inspection' })
  inspector_id: Inspection;

  @Prop({ required: true, type: String })
  notes: string;

  @Prop({ required: true, type: Boolean })
  damage_found: boolean;
}
export const ReportSchema = SchemaFactory.createForClass(Report);
