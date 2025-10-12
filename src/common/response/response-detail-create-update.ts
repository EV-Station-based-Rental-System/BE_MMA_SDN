import { ApiProperty } from "@nestjs/swagger";


export class ResponseDetail<T> {
  @ApiProperty({ example: {}, nullable: true })
  data: T | null;

  constructor(data: T | null) {
    this.data = data;
  }

  static ok<T>(data: T) {
    return new ResponseDetail<T>(data);
  }
}



