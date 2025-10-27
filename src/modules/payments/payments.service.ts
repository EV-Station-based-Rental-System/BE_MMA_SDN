import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Payment, PaymentDocument } from "src/models/payment.schema";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentPaginationDto } from "src/common/pagination/dto/payment/payment-pagination.dto";
import { PaymentFieldMapping } from "src/common/pagination/filters/payment-field-mapping";
import { applyCommonFiltersMongo } from "src/common/pagination/applyCommonFilters";
import { applySortingMongo } from "src/common/pagination/applySorting";
import { applyPaginationMongo } from "src/common/pagination/applyPagination";
import { applyFacetMongo } from "src/common/pagination/applyFacetMongo";
import { FacetResult } from "src/common/utils/type";
import { buildPaginationResponse } from "src/common/pagination/pagination-response";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseList } from "src/common/response/response-list";
import { ResponseMsg } from "src/common/response/response-message";

@Injectable()
export class PaymentsService {
  constructor(@InjectModel(Payment.name) private readonly paymentRepository: Model<PaymentDocument>) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<ResponseDetail<Payment>> {
    const payment = await this.paymentRepository.create(createPaymentDto);
    return ResponseDetail.ok(payment);
  }

  async findAll(filters: PaymentPaginationDto): Promise<ResponseList<Payment>> {
    const pipeline: any[] = [];

    applyCommonFiltersMongo(pipeline, filters, PaymentFieldMapping);
    const allowedSortFields = ["created_at", "amount_paid", "status"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "created_at");
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);

    const result = (await this.paymentRepository.aggregate(pipeline)) as FacetResult<Payment>;
    const payments = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;

    return ResponseList.ok(buildPaginationResponse(payments, { total, page: filters.page, take: filters.take }));
  }

  async findOne(id: string): Promise<ResponseDetail<Payment>> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }
    return ResponseDetail.ok(payment);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<ResponseDetail<Payment>> {
    const payment = await this.paymentRepository.findByIdAndUpdate(id, updatePaymentDto, { new: true });
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }
    return ResponseDetail.ok(payment);
  }

  async remove(id: string): Promise<ResponseMsg> {
    const payment = await this.paymentRepository.findByIdAndDelete(id);
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }
    return ResponseMsg.ok("Payment deleted successfully");
  }
}
