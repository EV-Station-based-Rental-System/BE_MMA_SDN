import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Admin {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true })
  user_id: mongoose.Types.ObjectId;

  @Prop({ required: false, type: String })
  title?: string;

  @Prop({ required: false, type: String })
  notes?: string;

  @Prop({ required: true, type: Date, default: Date.now })
  hire_date: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
