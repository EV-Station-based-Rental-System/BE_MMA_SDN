import { Prop, Schema } from '@nestjs/mongoose';
import { Staff } from './staff.schema';
import { Rental } from './rental.schema';
import { SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { InspectorType } from 'src/common/enums/inspector.enum';
export type InspectionDocument = HydratedDocument<Inspection>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Inspection {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Rental' })
  rental_id: Rental;

  @Prop({ required: true, enum: InspectorType, type: String })
  type: InspectorType;

  @Prop({ required: true, type: Date })
  inspection_at: Date;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Staff' })
  inspector_staff_id: Staff;

  @Prop({ required: true, type: Number })
  current_battery_capacity_kwh: number;

  @Prop({ required: true, type: Number })
  current_mileage: number;
}
export const InspectionSchema = SchemaFactory.createForClass(Inspection);
