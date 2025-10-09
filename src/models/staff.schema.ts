import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type StaffDocument = HydratedDocument<Staff>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Staff {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: User;

  @Prop({ required: true, unique: true, type: String })
  employeeCode: string;

  @Prop({ required: true, type: String })
  position: string;

  @Prop({ required: true, type: String })
  hire_date: string;
}
export const StaffSchema = SchemaFactory.createForClass(Staff);
