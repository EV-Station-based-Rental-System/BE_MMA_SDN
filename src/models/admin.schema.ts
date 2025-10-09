import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type AdminDocument = HydratedDocument<Admin>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Admin {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id: User;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ required: true, type: Date, default: Date.now })
  hire_date: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
