import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import { Report } from "src/models/report.schema";
import { CreateReportDto } from "./dto/create-report.dto";
import { UpdateReportDto } from "./dto/update-report.dto";
import { ReportPaginationDto } from "./dto/report-pagination.dto";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseList } from "src/common/response/response-list";
import { ResponseMsg } from "src/common/response/response-message";
import { NotFoundException } from "src/common/exceptions/not-found.exception";

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Report.name) private readonly reportRepository: Model<Report>) {}

  async create(createReportDto: CreateReportDto) {
    const created = await this.reportRepository.create(createReportDto);
    return ResponseDetail.ok(created);
  }

  async findAll(filters: ReportPaginationDto) {
    const { page = 1, take = 10, inspection_id, damage_found } = filters;

    const query: FilterQuery<Report> = {};
    if (inspection_id) {
      query.inspection_id = inspection_id;
    }
    if (damage_found !== undefined) {
      query.damage_found = damage_found;
    }

    const limit = Math.min(take ?? 10, 100);
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.reportRepository.find(query).skip(skip).limit(limit).sort({ created_at: -1 }).exec(),
      this.reportRepository.countDocuments(query),
    ]);

    return ResponseList.ok({
      data: reports,
      meta: {
        total,
        page,
        take: limit,
      },
    });
  }

  async findOne(id: string) {
    const report = await this.reportRepository.findById(id).exec();
    if (!report) {
      throw new NotFoundException("Report not found");
    }
    return ResponseDetail.ok(report);
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    const updated = await this.reportRepository.findByIdAndUpdate(id, updateReportDto, { new: true }).exec();

    if (!updated) {
      throw new NotFoundException("Report not found");
    }

    return ResponseDetail.ok(updated);
  }

  async remove(id: string) {
    const deleted = await this.reportRepository.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException("Report not found");
    }
    return ResponseMsg.ok("Report deleted successfully");
  }
}
