import { Injectable } from "@nestjs/common";
import { CreateContractDto } from "./dto/createContract.dto";
import { UpdateContractDto } from "./dto/updateContract.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Contract } from "src/models/contract.schema";
import { Model } from "mongoose";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ImagekitService } from "src/common/imagekit/imagekit.service";
import { BadRequestException } from "src/common/exceptions/bad-request.exception";

@Injectable()
export class ContractService {
  constructor(
    @InjectModel(Contract.name) private readonly contractRepository: Model<Contract>,
    private readonly imagekitService: ImagekitService,
  ) {}

  async create(createContractDto: CreateContractDto, file: any): Promise<ResponseDetail<Contract>> {
    if (!file) {
      throw new BadRequestException("Contract document file is required");
    }
    // check rental này đã tồn tại trong contract nào chưa
    const existingContract = await this.contractRepository.findOne({ rental_id: createContractDto.rental_id });
    if (existingContract) {
      throw new BadRequestException("A contract for this rental ID already exists");
    }

    // Generate file name with rental_id and label
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const fileExt = (file.mimetype as string).split("/")[1];
    const label = createContractDto.label || "contract";
    const fileName = `${createContractDto.rental_id}_${label}_${Date.now()}.${fileExt}`;

    // Upload file to ImageKit
    const uploadResult = await this.imagekitService.uploadContractImage(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      file.buffer,
      fileName,
    );

    if (!uploadResult.data) {
      throw new BadRequestException("Failed to upload contract document");
    }

    // Create contract with the ImageKit URL
    const newContract = new this.contractRepository({
      rental_id: createContractDto.rental_id,
      document_url: uploadResult.data.url,
      completed_at: new Date(),
    });

    const savedContract = await newContract.save();
    return ResponseDetail.ok(savedContract);
  }

  async update(id: string, updateContractDto: UpdateContractDto, file?: any): Promise<ResponseDetail<Contract>> {
    // Check if contract exists
    const existingContract = await this.contractRepository.findById(id);
    if (!existingContract) {
      throw new BadRequestException("Contract not found");
    }

    // If new file is provided, upload it
    if (file) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const fileExt = (file.mimetype as string).split("/")[1];
      const label = updateContractDto.label || "updated_contract";
      const fileName = `${existingContract.rental_id.toString()}_${label}_${Date.now()}.${fileExt}`;

      // Upload new file to ImageKit
      const uploadResult = await this.imagekitService.uploadContractImage(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        file.buffer,
        fileName,
      );

      if (!uploadResult.data) {
        throw new BadRequestException("Failed to upload contract document");
      }

      // Update document_url with new file
      existingContract.document_url = uploadResult.data.url;
    }

    // Save updated contract
    const updatedContract = await existingContract.save();
    return ResponseDetail.ok(updatedContract);
  }

  async remove(id: string): Promise<ResponseDetail<{ message: string }>> {
    const contract = await this.contractRepository.findByIdAndDelete(id);
    if (!contract) {
      throw new BadRequestException("Contract not found");
    }

    return ResponseDetail.ok({ message: "Contract deleted successfully" });
  }
}
