import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
export type RenterDocument = HydratedDocument<Renter>;
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Renter {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  })
  user_id: mongoose.Types.ObjectId;

  @Prop({ type: String })
  driver_license_no?: string;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: Date })
  date_of_birth?: Date;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  risk_score?: number;
}
export const RenterSchema = SchemaFactory.createForClass(Renter);
