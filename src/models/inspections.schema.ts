import { Prop, Schema } from '@nestjs/mongoose';
import { Staff } from './staff.schema';
import { Rental } from './rental.schema';
import { SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { InspectionType } from 'src/common/enums/inspection.enum';
export type InspectionDocument = HydratedDocument<Inspection>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Inspection {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Rental', index: true })
  rental_id: Rental;

  @Prop({ required: true, enum: InspectionType, type: String, default: InspectionType.PRE_RENTAL })
  type: InspectionType;

  @Prop({ required: true, type: Date, default: Date.now })
  inspected_at: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' })
  inspector_staff_id?: Staff;

  @Prop({ type: Number })
  current_battery_capacity_kwh?: number;

  @Prop({ required: true, type: Number })
  current_mileage: number;
}
export const InspectionSchema = SchemaFactory.createForClass(Inspection);

InspectionSchema.index({ rental_id: 1, type: 1 }, { unique: true, name: 'ux_inspections_rental_type' });
