import { BaseException } from "./base.exception";
import { HttpStatus } from "@nestjs/common";

export class ForbiddenException extends BaseException {
  constructor(message = "Access denied") {
    super(message, HttpStatus.FORBIDDEN);
  }
}
