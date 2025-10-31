import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Inspection } from "src/models/inspections.schema";
import { Rental } from "src/models/rental.schema";
import { Report } from "src/models/report.schema";
import { ReportsPhoto } from "src/models/reports_photo.schema";
import { CreateInspectionDto } from "./dto/createInspections.dto";
import { CompleteInspectionDto } from "./dto/completeInspection.dto";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseMsg } from "src/common/response/response-message";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { BadRequestException } from "src/common/exceptions/bad-request.exception";
import { InspectionType } from "src/common/enums/inspection.enum";
import { RentalStatus } from "src/common/enums/rental.enum";
import { ImagekitService } from "src/common/imagekit/imagekit.service";
import { StaffJwtUserPayload } from "src/common/utils/type";
import { BookingService } from "../bookings/booking.service";

@Injectable()
export class InspectionsService {
  constructor(
    @InjectModel(Inspection.name) private readonly inspectionRepository: Model<Inspection>,
    @InjectModel(Rental.name) private readonly rentalRepository: Model<Rental>,
    @InjectModel(Report.name) private readonly reportRepository: Model<Report>,
    @InjectModel(ReportsPhoto.name) private readonly reportsPhotoRepository: Model<ReportsPhoto>,
    private readonly imagekitService: ImagekitService,
    private readonly bookingService: BookingService,
  ) {}

  async create(createInspectionDto: CreateInspectionDto, user: StaffJwtUserPayload): Promise<ResponseDetail<Inspection>> {
    // check user role
    const staff = await this.bookingService.checkStaffExists(user._id);
    if (!staff) {
      throw new NotFoundException("Staff not found");
    }
    // Validate rental exists
    const rental = await this.rentalRepository.findById(createInspectionDto.rental_id);
    if (!rental) {
      throw new NotFoundException("Rental not found");
    }

    // Business rules validation based on inspection type
    if (createInspectionDto.type === InspectionType.PRE_RENTAL) {
      // Pre-rental: rental phải ở trạng thái RESERVED
      if (rental.status !== RentalStatus.RESERVED) {
        throw new BadRequestException("Pre-rental inspection can only be performed for rentals with RESERVED status");
      }

      // Kiểm tra xem đã có pre-rental inspection chưa
      const existingPreInspection = await this.inspectionRepository.findOne({
        rental_id: createInspectionDto.rental_id,
        type: InspectionType.PRE_RENTAL,
      });
      if (existingPreInspection) {
        throw new BadRequestException("Pre-rental inspection already exists for this rental");
      }
    } else if (createInspectionDto.type === InspectionType.POST_RENTAL) {
      // Post-rental: rental phải ở trạng thái IN_PROGRESS hoặc COMPLETED
      if (![RentalStatus.IN_PROGRESS, RentalStatus.COMPLETED].includes(rental.status)) {
        throw new BadRequestException("Post-rental inspection can only be performed for rentals with IN_PROGRESS or COMPLETED status");
      }

      // Kiểm tra xem đã có post-rental inspection chưa
      const existingPostInspection = await this.inspectionRepository.findOne({
        rental_id: createInspectionDto.rental_id,
        type: InspectionType.POST_RENTAL,
      });
      if (existingPostInspection) {
        throw new BadRequestException("Post-rental inspection already exists for this rental");
      }
    }

    const newInspection = new this.inspectionRepository({
      ...createInspectionDto,
      inspector_staff_id: staff.roleExtra._id,
      inspected_at: createInspectionDto.inspected_at || new Date(),
    });
    await newInspection.save();

    return ResponseDetail.ok(newInspection);
  }

  async uploadPhoto(inspectionId: string, file: any, label?: string): Promise<ResponseDetail<ReportsPhoto>> {
    // Validate inspection exists
    const inspection = await this.inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw new NotFoundException("Inspection not found");
    }

    // Xác định folder dựa vào inspection type
    let uploadResult: ResponseDetail<{ url: string }>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const fileExt = (file.mimetype as string).split("/")[1];
    const fileName = `${inspectionId}_${label || "photo"}_${Date.now()}.${fileExt}`;

    if (inspection.type === InspectionType.PRE_RENTAL) {
      // Pre-rental → Upload vào folder "before"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      uploadResult = await this.imagekitService.uploadBeforeImage(file.buffer, fileName);
    } else if (inspection.type === InspectionType.POST_RENTAL) {
      // Post-rental → Upload vào folder "after"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      uploadResult = await this.imagekitService.uploadAfterImage(file.buffer, fileName);
    } else {
      throw new BadRequestException("Invalid inspection type");
    }

    // Lưu photo record vào database
    const newPhoto = new this.reportsPhotoRepository({
      inspection_id: inspectionId,
      url: uploadResult.data?.url || "",
      label: label || "",
    });
    await newPhoto.save();

    return ResponseDetail.ok(newPhoto);
  }

  async getPhotos(inspectionId: string): Promise<ResponseDetail<Array<ReportsPhoto>>> {
    const inspection = await this.inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw new NotFoundException("Inspection not found");
    }

    const photos = await this.reportsPhotoRepository.find({ inspection_id: inspectionId }).exec();

    return ResponseDetail.ok(photos);
  }

  async completeInspection(id: string, completeDto: CompleteInspectionDto): Promise<ResponseDetail<{ inspection: Inspection; report?: Report }>> {
    const inspection = await this.inspectionRepository.findById(id).populate("rental_id");
    if (!inspection) {
      throw new NotFoundException("Inspection not found");
    }

    const rental = await this.rentalRepository.findById(inspection.rental_id);
    if (!rental) {
      throw new NotFoundException("Rental not found");
    }

    let report: Report | undefined;

    if (completeDto.damage_found) {
      const newReport = new this.reportRepository({
        inspection_id: inspection._id,
        damage_found: true,
        damage_notes: completeDto.damage_notes || "",
        damage_price: completeDto.damage_price || 0,
        is_over_deposit: completeDto.is_over_deposit || false,
        over_deposit_fee_amount: completeDto.over_deposit_fee_amount || 0,
      });
      await newReport.save();
      report = newReport;
    }

    // Cập nhật rental status based on inspection type
    if (inspection.type === InspectionType.PRE_RENTAL) {
      // Pre-rental hoàn thành → Xe sẵn sàng giao cho renter
      rental.status = RentalStatus.IN_PROGRESS;
      rental.pickup_datetime = new Date(); // Cập nhật thời gian nhận xe thực tế
    } else if (inspection.type === InspectionType.POST_RENTAL) {
      // Post-rental hoàn thành → Xe đã được trả lại
      rental.status = RentalStatus.COMPLETED;
      rental.actual_return_datetime = new Date();
    }

    await rental.save();

    return ResponseDetail.ok({
      inspection,
      report,
    });
  }

  async remove(id: string): Promise<ResponseMsg> {
    const inspection = await this.inspectionRepository.findByIdAndDelete(id);
    if (!inspection) {
      throw new NotFoundException("Inspection not found");
    }

    return ResponseMsg.ok("Inspection deleted successfully");
  }
}
