import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class UploadsService {
  generateDevUrl(filename?: string, contentType?: string): string {
    const id = randomUUID();
    const ext = this.inferExt(filename, contentType);
    return `https://dev-upload.local/${id}${ext}`;
  }

  private inferExt(filename?: string, contentType?: string): string {
    const fromName = filename?.split(".").pop()?.toLowerCase();
    if (fromName && fromName.length <= 5) return `.${fromName}`;
    switch (contentType) {
      case "image/jpeg":
        return ".jpg";
      case "image/png":
        return ".png";
      case "image/webp":
        return ".webp";
      default:
        return "";
    }
  }
}
