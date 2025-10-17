# Feature Specification: Registration & eKYC

**Feature Branch**: `[001-registration-ekyc]`  
**Created**: 2025-10-18  
**Status**: Draft  
**Input**: User description: "Registration & eKYC — High-Level Flow (Logic-First)"

## Clarifications

### Session 2025-10-18

- Q: Which contact verification gate is required before eKYC? → A: email verified only
- Q: What is the initial approach for auto-checking (OCR/face/liveness)? → A: Manual-only (auto-check disabled initially)
- Q: eKYC expiry policy? → A: No expiry in initial release (no auto-expiration)
- Q: Attempt caps and cooldown policy? → A: Not required; no automated caps/cooldowns in initial release
- Q: Minimum required documents to submit? → A: Any of DL/ID/passport + selfie (liveness optional)

## User Scenarios & Testing (mandatory)

### User Story 1 - Create Account with Contact Verification (Priority: P1)

Guest creates an account using email and password, receives an email OTP, verifies email, and can proceed to eKYC.

**Why this priority**: Enables all downstream processes; foundational entry to the platform.

**Independent Test**: Via `/auth/register/renter` followed by `/auth/send-otp` and `/auth/verify-email`. Validate `contact_verified` flags reflected and login works.

**Acceptance Scenarios**:

1. Given a new email, when renter registers, then account is created and OTP is sent.
2. Given a valid OTP, when verify-email is called, then email is marked verified and renter can login.
3. Given an invalid/expired OTP, when verify-email is called, then a 400 error is returned with appropriate message.

---

### User Story 2 - Submit eKYC Online (Priority: P1)

Renter uploads required docs: driver license (front/back) OR national ID (front/back) OR passport (photo page) plus selfie; liveness optional; then submits for checks.

**Why this priority**: Core to unlocking bookings; must be reliable and auditable.

**Independent Test**: Create a draft submission, upload documents, transition to submitted, observe `pending_review` awaiting manual decision.

**Acceptance Scenarios**:

1. Given a renter with verified contact, when they create an eKYC draft, then a single active `eKYCSubmission` is created.
2. Given an active draft, when documents are uploaded, then the draft stores file metadata, hashes, and validations.
3. Given a complete draft, when submit is called, then state transitions `draft → submitted → pending_review` and an event `ekyc.submitted` is emitted.

---

### User Story 3 - Manual Review (Staff Decision) (Priority: P1)

Staff can manually approve or reject submissions, providing reasons and evidence; all actions are logged to an immutable audit log.

**Why this priority**: Required for risk management and resolving ambiguous cases.

**Independent Test**: From a `pending_review` case, staff executes approve/reject endpoints and audit entries are persisted with attachments.

**Acceptance Scenarios**:

1. Given a submission in `pending_review`, when staff approves, then state becomes `approved` and an audit event is recorded with `staff_id` and evidence.
2. Given a submission in `pending_review`, when staff rejects, then state becomes `rejected` with reason and notifications are sent.

---

### User Story 4 - Fast Path at Station (Staff Verify) (Priority: P1)

At a station, staff re-captures ID/License and a live photo; they can approve normally or with override, with reason and photo evidence.

**Why this priority**: Enables in-person onboarding and recovery from online false negatives.

**Independent Test**: Execute station-verify flow with `approve` and `approve_with_override`; verify station metadata and attachments in audit log.

**Acceptance Scenarios**:

1. Given a renter without approved eKYC, when station verify approves, then renter is marked `approved` and audit includes `station_id`, `staff_id`, attachments.
2. Given a previously rejected online submission, when station override is executed with reason, then renter becomes `approved` and the override is policy-gated and logged.

---

### User Story 5 - Escalation (Priority: P2)

System may escalate to manual review or require station verification. No automated attempt caps/cooldowns in the initial release.

**Why this priority**: Prevents abuse and improves reviewer efficiency.

**Independent Test**: Trigger repeated failed checks; verify routing to `pending_review` or `station_required` per policy without automated cooldown blocks.

**Acceptance Scenarios**:

1. Given repeated failed checks, when policy deems risk elevated, then the next submission is routed to `pending_review` or `station_required` per rules.
2. Given repeated soft-fails, when policy applies, then the next submission is routed to `pending_review` or `station_required` per rules.

---

### User Story 6 - Notifications (Priority: P2)

System sends in-app and configured SMS/email notifications on each state transition with actionable messages.

**Why this priority**: Keeps users informed, lowers support volume.

**Independent Test**: For each transition, assert notification dispatch with correct channel and content.

**Acceptance Scenarios**:

1. Given a submission `submitted`, when it is queued to `pending_review`, then user receives confirmation and expected SLA.
2. Given a submission `rejected`, when notification is sent, then message includes reason and fix tips.

---

## Requirements (mandatory)

### Functional Requirements

- FR-001: System MUST allow account creation with OTP verification for email only (phone verification optional and not required to proceed).
- FR-002: System MUST create exactly one active `eKYCSubmission` per renter.
- FR-003: System MUST accept at least one of: driver license (front/back) OR national ID (front/back) OR passport (photo page), plus selfie; liveness optional.
- FR-004: Initial release MUST use manual review only: state transitions `draft → submitted → pending_review → approved | rejected` (auto-checking disabled; no expiry in initial release).
- FR-005: System MUST allow staff manual review with approve/reject, requiring reason and evidence attachments.
- FR-006: System MUST support a station fast path with `approve` and `approve_with_override`, capturing `staff_id`, `station_id`, timestamp, and photos.
- FR-007: No automated attempt caps/cooldowns in initial release; resubmissions allowed unless explicitly blocked by staff for abuse.
- FR-008: System MUST notify users on transitions via in-app and configured SMS/email.
- FR-009: System MUST maintain an immutable `AuditLog` for all checks, reviews, overrides, and notifications.
- FR-010: System MUST implement data retention windows (N years) and deletion on request with proper audit.
- FR-011: System MUST allow resubmission from non-approved states per policy rules.
- FR-012: System MUST support override of online rejection by station staff under policy gate, fully audited.
- FR-013: Auto-checking (OCR/face/liveness) is out-of-scope for the initial release and MAY be introduced in a subsequent iteration.
- FR-014: No auto-expiry of approved eKYC in initial release; approvals remain valid until policy updates.

### Key Entities

- User: Account with role and contact verification flags.
- eKYCSubmission: One active per renter; tracks lifecycle state and submissions.
- Document: Metadata for ID/passport, driver license, selfie, and liveness artifacts.
- ReviewAction: Manual decisions with reason, evidence, and actor.
- AuditLog: Immutable event timeline referencing entities and payloads with hash of attachments.

