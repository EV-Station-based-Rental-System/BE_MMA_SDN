import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StationDocument = HydratedDocument<Station>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Station {

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  address: string;

  @Prop({ type: Number })
  latitude?: number;

  @Prop({ type: Number })
  longitude?: number;

  @Prop({ type: Boolean, default: true })
  is_active: boolean;
}

export const StationSchema = SchemaFactory.createForClass(Station);
