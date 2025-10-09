import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from 'src/common/enums/role.enum';

export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class User {
  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  password_hash: string;

  @Prop({ required: true, type: String })
  full_name: string;

  @Prop({ required: true, type: String, enum: Role })
  role: string;

  @Prop({ required: true, type: Boolean, default: true })
  is_active: boolean;

  @Prop({ required: false, type: String })
  phone: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
