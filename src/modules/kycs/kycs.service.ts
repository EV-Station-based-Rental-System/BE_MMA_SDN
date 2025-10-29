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

@Injectable()
export class KycsService {
  constructor(
    @InjectModel(Kycs.name) private readonly kycsRepository: Model<Kycs>,

    private readonly bookingService: BookingService,
  ) {}

  async create(createKycsDto: CreateKycsDto, user: RenterJwtUserPayload): Promise<ResponseDetail<Kycs>> {
    const renter = await this.bookingService.checkRenterExist(user._id);
    const newKyc = new this.kycsRepository({
      ...createKycsDto,
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

  async changeStatus(id: string, changeStatusDto: ChangeKycStatusDto): Promise<ResponseDetail<Kycs>> {
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

    return ResponseDetail.ok(updatedKyc);
  }

  async remove(id: string): Promise<ResponseMsg> {
    const result = await this.kycsRepository.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException("KYC document not found");
    }
    return ResponseMsg.ok("KYC document deleted successfully");
  }
}
