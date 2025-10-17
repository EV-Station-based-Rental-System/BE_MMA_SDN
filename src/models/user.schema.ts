import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Role } from "src/common/enums/role.enum";

export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class User {
  save() {
    throw new Error("Method not implemented.");
  }

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
  phone?: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
