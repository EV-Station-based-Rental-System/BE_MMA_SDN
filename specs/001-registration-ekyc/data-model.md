# Registration & eKYC — Data Model (v1 Manual)

## Entities

### User (augment)
- Fields (add): `email_verified_at?: Date`, `phone_verified_at?: Date`, `contact_verified: boolean` (derived by policy)

### eKYCSubmission
- Fields: `_id`, `renter_id (idx)`, `state: 'draft'|'submitted'|'pending_review'|'approved'|'rejected'`, `status_reason?`, `submitted_at?`, `decided_at?`, `attachments: ObjectId[]`, `latest_review_action_id?`, `created_at`
- Indexes: `{ renter_id: 1, created_at: -1 }`; enforce one active submission per renter via `active: boolean` + unique `{ renter_id, active: 1 }`

### Document
- Fields: `_id`, `submission_id`, `type: 'id_front'|'id_back'|'dl_front'|'dl_back'|'passport'|'selfie'|'liveness'`, `storage_url`, `content_hash`, `mime_type`, `size_bytes`, `created_at`
- Indexes: unique `{ submission_id, type }`

### ReviewAction
- Fields: `_id`, `submission_id`, `actor: { type: 'staff'|'system', id?, station_id? }`, `action: 'approve'|'reject'|'approve_with_override'`, `reason_code`, `reason_text?`, `evidence_doc_ids?`, `created_at`
- Indexes: `{ submission_id: 1, created_at: -1 }`

### AuditLog
- Fields: `_id`, `event`, `actor`, `entity`, `payload_hash`, `attachments?`, `created_at`
- Indexes: `{ 'entity.type': 1, 'entity.id': 1, created_at: -1 }`

## State Machine (v1)
- `draft → submitted → pending_review → approved | rejected`
- Guards: `contact_verified == true` before submit; one active submission per renter.
- Side effects: emit `AuditLog` and notifications on every transition.

## Policies (v1)
- Attempts: No automated caps/cooldowns; staff may block for abuse.
- Expiry: None; approved remains valid until policy changes.
- Resubmission: Allowed from non-approved states; prior submissions marked inactive.

