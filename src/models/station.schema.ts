import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiSchema } from "@nestjs/swagger";
import { HydratedDocument } from "mongoose";

export type StationDocument = HydratedDocument<Station>;

@ApiSchema({
  name: "Station"
})
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Station {
  @Prop({ required: true, type: String, trim: true })
  name: string;

  @Prop({ required: true, type: String, trim: true })
  address: string;

  @Prop({ type: Number })
  latitude?: number;

  @Prop({ type: Number })
  longitude?: number;

  @Prop({ type: Boolean, default: true })
  is_active: boolean;
}

export const StationSchema = SchemaFactory.createForClass(Station);
