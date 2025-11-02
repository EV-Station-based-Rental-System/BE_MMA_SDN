import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Kycs } from "src/models/kycs.schema";
import { CreateKycsDto } from "./dto/createKycs.dto";
import { UpdateKycsDto } from "./dto/updateKycs.dto";
import { ChangeKycStatusDto } from "./dto/changeStatus.dto";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseMsg } from "src/common/response/response-message";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { KycStatus } from "src/common/enums/kyc.enum";
import { BookingService } from "../bookings/booking.service";
import { RenterJwtUserPayload } from "src/common/utils/type";
import { ConflictException } from "src/common/exceptions/conflict.exception";
import { ImagekitService } from "src/common/imagekit/imagekit.service";
import { InternalServerErrorException } from "src/common/exceptions/internal-server-error.exception";

export type KycDocumentFile = {
  buffer: Buffer;
  originalname?: string;
};

@Injectable()
export class KycsService {
  constructor(
    @InjectModel(Kycs.name) private readonly kycsRepository: Model<Kycs>,
    private readonly bookingService: BookingService,
    private readonly imagekitService: ImagekitService,
  ) {}

  async create(createKycsDto: CreateKycsDto, user: RenterJwtUserPayload, file?: KycDocumentFile): Promise<ResponseDetail<Kycs>> {
    // check renter exist
    const renter = await this.bookingService.checkRenterExist(user._id);
    // check for existing KYC
    const existingKyc = await this.kycsRepository.findOne({
      renter_id: renter.roleExtra._id,
    });
    if (existingKyc) {
      throw new ConflictException("An existing KYC document already exists for this renter");
    }
    const payload: CreateKycsDto & { document_img_url?: string } = { ...createKycsDto };

    if (file) {
      const originalName = file.originalname ?? "kyc-document.png";
      const extension = originalName.includes(".") ? originalName.split(".").pop() || "png" : "png";
      const normalizedDocumentNumber = createKycsDto.document_number?.trim().replace(/\s+/g, "-") || "kyc";
      const fileName = `${normalizedDocumentNumber}-${Date.now()}.${extension}`;
      if (!file.buffer) {
        throw new InternalServerErrorException("Invalid file buffer received");
      }
      const uploadResult = await this.imagekitService.uploadKycDocumentImage(file.buffer, fileName);
      const uploadedUrl = uploadResult.data?.url;
      if (!uploadedUrl) {
        throw new InternalServerErrorException("Failed to upload KYC document image");
      }
      payload.document_img_url = uploadedUrl;
    }

    const newKyc = new this.kycsRepository({
      ...payload,
      renter_id: renter.roleExtra._id,
      status: KycStatus.SUBMITTED,
      submitted_at: new Date(),
    });
    const savedKyc = await newKyc.save();
    return ResponseDetail.ok(savedKyc);
  }

  async update(id: string, updateKycsDto: UpdateKycsDto): Promise<ResponseDetail<Kycs>> {
    const updatedKyc = await this.kycsRepository.findByIdAndUpdate(id, updateKycsDto, { new: true });
    if (!updatedKyc) {
      throw new NotFoundException("KYC document not found");
    }
    return ResponseDetail.ok(updatedKyc);
  }

  async changeStatus(id: string, changeStatusDto: ChangeKycStatusDto): Promise<ResponseMsg> {
    const updateData: Record<string, unknown> = {
      status: changeStatusDto.status,
    };

    // Nếu status là APPROVED, cập nhật verified_at
    if (changeStatusDto.status === KycStatus.APPROVED) {
      updateData.verified_at = new Date();
    }

    const updatedKyc = await this.kycsRepository.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedKyc) {
      throw new NotFoundException("KYC document not found");
    }

    return ResponseMsg.ok("KYC status updated successfully");
  }

  async remove(id: string): Promise<ResponseMsg> {
    const result = await this.kycsRepository.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException("KYC document not found");
    }
    return ResponseMsg.ok("KYC document deleted successfully");
  }
}
