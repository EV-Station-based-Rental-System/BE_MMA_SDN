import { IsEnum, IsNotEmpty } from "class-validator";
import { KycStatus } from "src/common/enums/kyc.enum";

export class ChangeKycStatusDto {
  @IsNotEmpty()
  @IsEnum(KycStatus)
  status: KycStatus;
}
