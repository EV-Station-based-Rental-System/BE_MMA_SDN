import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose from "mongoose";
import { KycStatus, KycType } from "src/common/enums/kyc.enum";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Kycs {
  @ApiProperty({ type: String, description: "Renter ID reference" })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Renter", index: true })
  renter_id: mongoose.Types.ObjectId;

  @ApiProperty({ enum: KycType, description: "Type of KYC document", example: KycType.DRIVER_LICENSE })
  @Prop({
    required: true,
    enum: Object.values(KycType),
    default: KycType.DRIVER_LICENSE,
    type: String,
  })
  type: KycType;

  @ApiProperty({ type: String, description: "Document identification number" })
  @Prop({ required: true, type: String })
  document_number: string;

  @ApiProperty({ type: Date, required: false, description: "Document expiry date" })
  @Prop({ type: Date })
  expiry_date?: Date;

  @ApiProperty({ enum: KycStatus, description: "KYC verification status", example: KycStatus.SUBMITTED })
  @Prop({
    required: true,
    enum: Object.values(KycStatus),
    default: KycStatus.SUBMITTED,
    type: String,
  })
  status: KycStatus;

  @ApiProperty({ type: Date, description: "Submission timestamp" })
  @Prop({ required: true, type: Date, default: Date.now })
  submitted_at: Date;

  @ApiProperty({ type: Date, required: false, description: "Verification timestamp" })
  @Prop({ type: Date })
  verified_at?: Date;
}

export const KycsSchema = SchemaFactory.createForClass(Kycs);
