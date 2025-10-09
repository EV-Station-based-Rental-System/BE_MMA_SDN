import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ContractStatus, EsignProvider } from 'src/common/enums/contract.enum';

export type ContractDocument = HydratedDocument<Contract>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Contract {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true,
    unique: true,
  })
  contract_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Rental', unique: true })
  rental_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Number, default: 1 })
  version: number;

  @Prop({
    required: true,
    enum: Object.values(ContractStatus),
    type: String,
    default: ContractStatus.ISSUED,
  })
  status: ContractStatus;

  @Prop({ required: true, type: Date, default: Date.now })
  issued_at: Date;

  @Prop({ type: Date })
  completed_at?: Date;

  @Prop({
    required: true,
    enum: Object.values(EsignProvider),
    type: String,
    default: EsignProvider.NATIVE,
  })
  provider: EsignProvider;

  @Prop({ type: String })
  provider_envelope_id?: string;

  @Prop({ required: true, type: String })
  document_url: string;

  @Prop({ required: true, type: String })
  document_hash: string;

  @Prop({ required: true, type: Boolean, default: false })
  ltv_enabled: boolean;

  @Prop({ type: String })
  audit_trail_url?: string;
}
export const ContractSchema = SchemaFactory.createForClass(Contract);

ContractSchema.index({ contract_id: 1 }, { unique: true });
ContractSchema.index({ rental_id: 1 }, { unique: true });
