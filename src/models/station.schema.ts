import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema } from '@nestjs/mongoose/dist/decorators/schema.decorator';
import { HydratedDocument } from 'mongoose';

export type StationDocument = HydratedDocument<Station>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Station {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  address: string;

  @Prop({ required: true, type: String })
  latitude: string;

  @Prop({ required: true, type: String })
  longitude: string;
}

export const StationSchema = SchemaFactory.createForClass(Station);
