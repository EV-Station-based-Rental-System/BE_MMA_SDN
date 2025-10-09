import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Inspection } from './inspections.schema';
import { Report } from './report.schema';

export type ReportsPhotoDocument = HydratedDocument<ReportsPhoto>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class ReportsPhoto {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Report' })
  report_id: Report;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Inspection' })
  inspection_id: Inspection;
  @Prop({ required: true, type: String })
  url: string;

  @Prop({ required: true, type: String })
  label: string;
}
export const ReportsPhotoSchema = SchemaFactory.createForClass(ReportsPhoto);
