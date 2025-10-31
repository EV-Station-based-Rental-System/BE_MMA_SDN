import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  Put,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { ContractService } from "./contract.service";
import { CreateContractDto } from "./dto/createContract.dto";
import { UpdateContractDto } from "./dto/updateContract.dto";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";

@Controller()
@Roles(Role.ADMIN, Role.STAFF)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Create contract with document upload" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        rental_id: {
          type: "string",
          description: "ID của rental (thuê xe)",
          example: "rental_id",
        },
        label: {
          type: "string",
          description: "Nhãn mô tả cho file hợp đồng (optional)",
          example: "Hợp đồng của anh Chấn 18/9",
        },
        file: {
          type: "string",
          format: "binary",
          description: "Contract document file (jpg, jpeg, png, pdf) - Max 10MB",
        },
      },
      required: ["rental_id", "file"],
    },
  })
  create(
    @Body() createContractDto: CreateContractDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|pdf)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024, // 10MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: any,
  ) {
    return this.contractService.create(createContractDto, file);
  }

  @Put(":id")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Update contract with optional new document" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        label: {
          type: "string",
          description: "Nhãn mô tả cho file hợp đồng mới (optional)",
          example: "Hợp đồng cập nhật",
        },
        file: {
          type: "string",
          format: "binary",
          description: "Contract document file (jpg, jpeg, png, pdf) - Max 10MB - Optional",
        },
      },
    },
  })
  update(
    @Param("id") id: string,
    @Body() updateContractDto: UpdateContractDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|pdf)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024, // 10MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    file?: any,
  ) {
    return this.contractService.update(id, updateContractDto, file);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete contract" })
  remove(@Param("id") id: string) {
    return this.contractService.remove(id);
  }
}
