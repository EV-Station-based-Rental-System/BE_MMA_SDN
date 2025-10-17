import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { KycStatus, KycType } from "src/common/enums/kyc.enum";

export type KycsDocument = HydratedDocument<Kycs>;
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Kycs {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Renter", index: true })
  renter_id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(KycType),
    default: KycType.DRIVER_LICENSE,
    type: String,
  })
  type: KycType;

  @Prop({ required: true, type: String })
  document_number: string;

  @Prop({ type: Date })
  expiry_date?: Date;

  @Prop({
    required: true,
    enum: Object.values(KycStatus),
    default: KycStatus.SUBMITTED,
    type: String,
  })
  status: KycStatus;

  @Prop({ required: true, type: Date, default: Date.now })
  submitted_at: Date;

  @Prop({ type: Date })
  verified_at?: Date;
}

export const KycsSchema = SchemaFactory.createForClass(Kycs);
