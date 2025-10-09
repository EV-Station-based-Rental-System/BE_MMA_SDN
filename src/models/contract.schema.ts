import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Rental } from './rental.schema';
import { ContractProvider, ContractStatus } from 'src/common/enums/contract.enum';

export type ContractDocument = HydratedDocument<Contract>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Contract {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Rental' })
  rental_id: Rental;

  @Prop({ required: true, default: 1 })
  version: number;

  @Prop({ required: true, enum: ContractStatus, type: String })
  status: ContractStatus;

  @Prop({ required: true, type: Date })
  issued_at: Date;

  @Prop({ required: true, type: Date })
  completed_at: Date;

  @Prop({ required: true, enum: ContractProvider, type: String })
  provider: ContractProvider;

  @Prop({ required: true, type: String })
  provider_envelope_id: string;

  @Prop({ required: true, type: String })
  document_url: string;

  @Prop({ required: true, type: String })
  document_hash: string;

  @Prop({ required: true, type: Boolean, default: false })
  ltv_enabled: boolean;

  @Prop({ required: true, type: String })
  audit_trail_url: string;
}
export const ContractSchema = SchemaFactory.createForClass(Contract);
