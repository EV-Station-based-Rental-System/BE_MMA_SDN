import { mixin } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Type as TransformType } from "class-transformer";
import { ValidateNested, IsOptional } from "class-validator";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseList } from "src/common/response/response-list";
import { ResponseMsg } from "src/common/response/response-message";

type Constructor<T = any> = new (...args: any[]) => T;

export function SwaggerResponseDetailDto<TBase extends Constructor>(Base: TBase) {
  class ResponseDetailDto extends ResponseDetail<InstanceType<TBase>> {
    @ApiProperty({ type: Base, nullable: true })
    @TransformType(() => Base)
    @ValidateNested()
    @IsOptional()
    declare data: InstanceType<TBase> | null;
  }

  return mixin(ResponseDetailDto);
}

export function SwaggerResponseListDto<TBase extends Constructor>(Base: TBase) {
  class ResponseListDto extends ResponseList<InstanceType<TBase>> {
    @ApiProperty({ isArray: true, type: Base })
    @TransformType(() => Base)
    @ValidateNested({ each: true })
    declare data: Array<InstanceType<TBase>>;

    @ApiProperty({
      example: {
        total: 100,
        page: 1,
        take: 10,
        totalPages: 10,
      },
    })
    declare meta: Record<string, any>;
  }

  return mixin(ResponseListDto);
}

// Optional helper when you want to reference a message-only response in Swagger
export class SwaggerResponseMessageDto extends ResponseMsg {
  @ApiProperty({ example: "Action completed successfully" })
  declare message: string;
}
