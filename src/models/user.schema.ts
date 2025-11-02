import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Role } from "src/common/enums/role.enum";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class User {
  @Prop({ required: true, type: String, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, type: String })
  full_name: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(Role),
    default: Role.UNKNOWN,
  })
  role: Role;

  @Prop({ required: true, type: Boolean, default: true })
  is_active: boolean;

  @Prop({ required: false, type: String })
  phone: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
