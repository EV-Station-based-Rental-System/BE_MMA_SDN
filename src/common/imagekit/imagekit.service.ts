// import { Injectable, Inject } from "@nestjs/common";
// import ImageKit from "imagekit";
// import { InternalServerErrorException } from "../exceptions/internal-server-error.exception";
// import { ResponseDetail } from "../response/response-detail-create-update";

// export enum ImageFolder {
//   CONTRACT = "BE_SDN_MMA/contract",
//   AFTER = "BE_SDN_MMA/after",
//   BEFORE = "BE_SDN_MMA/before",
// }

// @Injectable()
// export class ImagekitService {
//   constructor(@Inject("IMAGEKIT") private readonly imagekit: ImageKit) {}

//   private async uploadToFolder(fileBuffer: Buffer, fileName: string, folder: ImageFolder) {
//     try {
//       const result = await this.imagekit.upload({
//         file: fileBuffer.toString("base64"),
//         fileName,
//         folder,
//         useUniqueFileName: true,
//       });
//       return { url: result.url };
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Unknown error";
//       throw new InternalServerErrorException(`Image upload failed: ${errorMessage}`);
//     }
//   }

//   async uploadContractImage(fileBuffer: Buffer, fileName: string): Promise<ResponseDetail<{ url: string }>> {
//     const result = await this.uploadToFolder(fileBuffer, fileName, ImageFolder.CONTRACT);
//     return ResponseDetail.ok(result);
//   }

//   async uploadAfterImage(fileBuffer: Buffer, fileName: string): Promise<ResponseDetail<{ url: string }>> {
//     const result = await this.uploadToFolder(fileBuffer, fileName, ImageFolder.AFTER);
//     return ResponseDetail.ok(result);
//   }

//   async uploadBeforeImage(fileBuffer: Buffer, fileName: string): Promise<ResponseDetail<{ url: string }>> {
//     const result = await this.uploadToFolder(fileBuffer, fileName, ImageFolder.BEFORE);
//     return ResponseDetail.ok(result);
//   }

//   async deleteImage(fileId: string): Promise<void> {
//     try {
//       await this.imagekit.deleteFile(fileId);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Unknown error";
//       throw new InternalServerErrorException(`Image deletion failed: ${errorMessage}`);
//     }
//   }

//   getAuthParams() {
//     try {
//       return this.imagekit.getAuthenticationParameters();
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Unknown error";
//       throw new InternalServerErrorException(`Failed to get auth params: ${errorMessage}`);
//     }
//   }
// }
