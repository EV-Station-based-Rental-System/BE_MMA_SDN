import { Request } from "express";
import { BaseJwtUserPayload } from "../utils/type";

export interface AuthRequest extends Request {
  user: BaseJwtUserPayload;
}
