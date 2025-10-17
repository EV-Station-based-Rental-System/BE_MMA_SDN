# Registration & eKYC — Phase 0 Research

## Decisions

- Contact verification: Email OTP required; phone optional.
- Auto-checking: Manual-only in initial release (no OCR/face/liveness vendor integration yet).
- Attempts/cooldown: None automated in v1; allow resubmits unless staff blocks for abuse.
- Expiry: No auto-expiry of approvals in v1; policy to be defined later.
- Minimum docs: Any of Driver License (front/back) OR National ID (front/back) OR Passport (photo page), plus selfie; liveness optional.

## Rationale

- Speed to MVP: Manual-only reduces integration complexity and allows operations to validate process while productizing flows.
- Operational control: Manual review ensures risk management while data volume ramps.
- UX: Supporting DL/ID/Passport simplifies onboarding across user types and regions.
- Maintainability: Deferring vendor lock-in until requirements stabilize.

## Alternatives Considered

- External eKYC vendor (OCR + face + liveness)
  - Pros: Faster automated decisions, lower manual workload
  - Cons: Cost, integration complexity, vendor lock-in, data transfer concerns
- Attempt caps (e.g., 3/day) with cooldown
  - Pros: Reduces abuse
  - Cons: Adds friction; policy tuning required; out-of-scope for v1
- Expiry windows (12/24/36 months)
  - Pros: Keeps identity fresh
  - Cons: Operational overhead; defer until clear regulatory need

## Open Questions (Deferred to future iterations)

- SLA for manual review beyond 24h p95 (business ops target)
- Regional document variations and parsing standards
- Vendor evaluation criteria for automation (accuracy, latency, security posture)
- Data retention period (N years) and anonymization specifics

