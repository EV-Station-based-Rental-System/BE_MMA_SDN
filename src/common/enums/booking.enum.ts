export enum BookingStatus {
  PENDING_VERIFICATION = "pending_verification",
  VERIFIED = "verified",
  CANCELLED = "cancelled",
}

export enum BookingVerificationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED_MISMATCH = "rejected_mismatch",
  REJECTED_OTHER = "rejected_other",
}

export enum RentalUntil {
  HOURS = "hours",
  DAYS = "days",
}
