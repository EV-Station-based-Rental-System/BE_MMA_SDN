import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Renter } from './renter.schema';
import { KycsStatus, KycsType } from 'src/common/enums/kycs.enum';

export type KycsDocument = HydratedDocument<Kycs>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Kycs {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Renter' })
  renter_id: Renter;

  @Prop({ required: true, enum: KycsType, default: KycsType.DRIVER_LICENSE, type: String })
  type: KycsType;

  @Prop({ required: true, enum: KycsStatus, default: KycsStatus.SUBMITTED, type: String })
  status: KycsStatus;

  @Prop({ required: true, type: Date, default: Date.now })
  submitted_at: Date;

  @Prop({ required: false, type: Date })
  verified_at: Date;
}

export const KycsSchema = SchemaFactory.createForClass(Kycs);
