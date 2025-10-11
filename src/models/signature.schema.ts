import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { SignatureEvent, SignaturePartyRole, SignatureType } from 'src/common/enums/signature.enum';

export type SignatureDocument = HydratedDocument<Signature>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Signature {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true, index: true })
  contract_id: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(SignaturePartyRole),
    required: true,
  })
  role: SignaturePartyRole;

  @Prop({ type: String, enum: Object.values(SignatureEvent) })
  signature_event?: SignatureEvent;

  @Prop({
    type: String,
    enum: Object.values(SignatureType),
    required: true,
    default: SignatureType.DIGITAL_CERT,
  })
  type: SignatureType;

  @Prop({ required: true, type: Date, default: Date.now })
  signed_at: Date;

  @Prop({ type: String })
  signer_ip?: string;

  @Prop({ type: String })
  user_agent?: string;

  @Prop({ type: String })
  provider_signature_id?: string;

  @Prop({ type: String })
  signature_image_url?: string;

  @Prop({ type: String })
  cert_subject?: string;

  @Prop({ type: String })
  cert_issuer?: string;

  @Prop({ type: String })
  cert_serial?: string;

  @Prop({ type: String })
  cert_fingerprint_sha256?: string;

  @Prop({ type: String })
  signature_hash?: string;

  @Prop({ type: String })
  evidence_url?: string;
}

export const SignatureSchema = SchemaFactory.createForClass(Signature);
