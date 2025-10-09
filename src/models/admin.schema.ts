import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type AdminDocument = HydratedDocument<Admin>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Admin {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: User;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  notes: string;

  @Prop({ required: true, type: Date })
  hire_date: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
