import { Type } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { PaginationMetaDto } from "./pagination-meta.dto";

export interface PaginatedResponseDto<TData> {
  data: TData[];
  meta: PaginationMetaDto;
}

export const createPaginatedResponseDto = <TModel>(model: Type<TModel>) => {
  class PaginatedResponse implements PaginatedResponseDto<TModel> {
    @ApiProperty({ type: model, isArray: true })
    data: TModel[];

    @ApiProperty({ type: PaginationMetaDto })
    meta: PaginationMetaDto;
  }

  return PaginatedResponse;
};
