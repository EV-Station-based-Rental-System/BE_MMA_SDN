import { ApiProperty } from "@nestjs/swagger";

export class GoogleDto {
  @ApiProperty({ description: "Google ID token received from client" })
  id_token: string;
}
