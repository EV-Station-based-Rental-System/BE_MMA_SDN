import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
export type RenterDocument = HydratedDocument<Renter>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Renter {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: User;

  @Prop({ required: true, type: String })
  driver_license: string;

  @Prop({ required: true, type: String })
  address: string;

  @Prop({ required: true, type: Date })
  date_of_birth: Date;

  @Prop({ required: true, type: Number, default: 0, min: 0, max: 100 })
  risk_score: number;
}
export const RenterSchema = SchemaFactory.createForClass(Renter);
