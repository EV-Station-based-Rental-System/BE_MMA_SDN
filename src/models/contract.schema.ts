import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type ContractDocument = HydratedDocument<Contract>;
@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class Contract {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Rental", unique: true })
  rental_id: mongoose.Types.ObjectId;

  @Prop({ type: Date })
  completed_at?: Date;

  @Prop({ required: true, type: String })
  document_url: string;

}
export const ContractSchema = SchemaFactory.createForClass(Contract);
