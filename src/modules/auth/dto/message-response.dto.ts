import { ApiProperty } from "@nestjs/swagger";

export class MessageResponseDto {
  @ApiProperty({
    description: "Human-readable summary of the completed action",
    example: "Create renter successfully",
  })
  msg: string;
}
