import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from 'src/common/enums/role.enum';
import { SignatureEvent, SignatureType } from 'src/common/enums/signature.enum';

export type SignatureDocument = HydratedDocument<Signature>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Signature {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true })
  contract_id: string;

  @Prop({ type: String, enum: Role, required: true })
  role: Role;

  @Prop({ type: String, enum: SignatureEvent, required: true })
  signature_event: SignatureEvent;

  @Prop({ type: String, enum: SignatureType, required: true })
  type: SignatureType;

  @Prop({ required: true, type: Date })
  signed_at: Date;

  @Prop({ required: true, type: String })
  signer_ip_address: string;

  @Prop({ required: true, type: String })
  user_agent: string;

  @Prop({ required: true, type: String })
  provider_signature_id: string;

  @Prop({ required: true, type: String })
  signature_image_url: string;

  @Prop({ required: true, type: String })
  cert_subject: string;

  @Prop({ required: true, type: String })
  cert_issuer: string;

  @Prop({ required: true, type: Date })
  cert_serial: string;

  @Prop({ required: true, type: Date })
  cert_fingerprint_sha256: string;

  @Prop({ required: true, type: String })
  signature_hash: string;

  @Prop({ required: true, type: String })
  evidence_url: string;
}

export const SignatureSchema = SchemaFactory.createForClass(Signature);
