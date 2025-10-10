import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { InspectionType } from 'src/common/enums/inspection.enum';
export type InspectionDocument = HydratedDocument<Inspection>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Inspection {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true,
    unique: true,
  })
  inspection_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Rental', index: true })
  rental_id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(InspectionType),
    type: String,
    default: InspectionType.PRE_RENTAL,
  })
  type: InspectionType;

  @Prop({ required: true, type: Date, default: Date.now })
  inspected_at: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' })
  inspector_staff_id?: mongoose.Types.ObjectId;

  @Prop({ type: Number })
  current_battery_capacity_kwh?: number;

  @Prop({ required: true, type: Number })
  current_mileage: number;
}
export const InspectionSchema = SchemaFactory.createForClass(Inspection);

InspectionSchema.index({ rental_id: 1, type: 1 }, { unique: true, name: 'ux_inspections_rental_type' });
InspectionSchema.index({ inspection_id: 1 }, { unique: true });
InspectionSchema.index({ rental_id: 1 });
InspectionSchema.index({ type: 1 });
