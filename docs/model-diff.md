# Model Diff

- Generated at: 2025-10-09T19:33:16.004Z
- DBML spec: docs/model-spec.json
- Code map: docs/current-model-map.json

## Enum Overview
- Missing enums: booking_status, booking_verification_status, confirmation_type, contract_status, esign_provider, fee_type, inspection_type, kyc_status, kyc_type, party_role, payment_method, payment_status, rental_status, signature_event_type, signature_type, transfer_status, user_role, vehicle_at_stations_status_t
- Extra enums: ContractProvider, ContractStatus, FeeType, InspectorType, KycsStatus, KycsType, PaymentMethod, PaymentStatus, RetalStatus, Role, SignatureEvent, SignatureType, StaffTransferStatus, StatusBooking, StatusVehicleAtStation, VehicleTransferStatus, VerificationStatus

## Collections Overview
- Missing collections: reports_photo, staff
- Extra collections: reports_photos, staffs

### admins
- Field `user_id`: type spec=Types.ObjectId current=User; unique spec=true current=false
- Field `title`: required spec=false current=true
- Field `notes`: required spec=false current=true
- Field `hire_date`: default spec=Date.now current=null
- Indexes: ✅ Matches spec
- Missing relations: user_id->users | user_id->vehicle_transfers | user_id->staff_transfers
- Extra relations: user_id->user

### bookings
- Missing fields: booking_id, booking_created_at
- Extra fields: booking_create_at
- Field `renter_id`: type spec=Types.ObjectId current=Renter
- Field `vehicle_at_station_id`: type spec=Types.ObjectId current=VehicleAtStation
- Field `expected_return_datetime`: required spec=false current=true
- Field `status`: type spec=enum:booking_status current=StatusBooking; default spec=pending_verification current=StatusBooking.PENDING_VERIFICATION
- Field `verification_status`: type spec=enum:booking_verification_status current=VerificationStatus; default spec=pending current=VerificationStatus.PENDING
- Field `verified_by_staff_id`: type spec=Types.ObjectId current=Staff; required spec=false current=true
- Missing indexes: renter_id | vehicle_at_station_id
- Missing relations: renter_id->renters | vehicle_at_station_id->vehicle_at_stations | verified_by_staff_id->staff | booking_id->fees | booking_id->rentals
- Extra relations: renter_id->renter | vehicle_at_station_id->vehicleatstation | verified_by_staff_id->user

### contracts
- Missing fields: contract_id, updated_at
- Field `rental_id`: type spec=Types.ObjectId current=Rental
- Field `status`: type spec=enum:contract_status current=ContractStatus; default spec=issued current=null
- Field `issued_at`: default spec=Date.now current=null
- Field `completed_at`: required spec=false current=true
- Field `provider`: type spec=enum:esign_provider current=ContractProvider; default spec=native current=null
- Field `provider_envelope_id`: required spec=false current=true
- Field `audit_trail_url`: required spec=false current=true
- Indexes: ✅ Matches spec
- Missing relations: rental_id->rentals | contract_id->signatures
- Extra relations: rental_id->rental

### fees
- Missing fields: fee_id, created_at
- Field `booking_id`: type spec=Types.ObjectId current=Booking
- Field `type`: type spec=enum:fee_type current=FeeType; default spec=deposit current=null
- Field `amount`: type spec=Decimal128 current=number
- Field `currency`: default spec=USD current=null
- Missing indexes: booking_id
- Missing relations: booking_id->bookings | fee_id->payments
- Extra relations: booking_id->booking

### inspections
- Missing fields: inspection_id, inspected_at
- Extra fields: inspection_at
- Field `rental_id`: type spec=Types.ObjectId current=Rental
- Field `type`: type spec=enum:inspection_type current=InspectorType; default spec=pre_rental current=null
- Field `inspector_staff_id`: type spec=Types.ObjectId current=Staff; required spec=false current=true
- Field `current_battery_capacity_kwh`: required spec=false current=true
- Missing indexes: rental_id, type
- Missing relations: rental_id->rentals | inspection_id->reports
- Extra relations: rental_id->rental
- Relation [inspector_staff_id->staff]: type spec=belongsTo current=referencesOne; onDelete=set null

### kycs
- Missing fields: kyc_id, document_number, expiry_date
- Field `renter_id`: type spec=Types.ObjectId current=Renter
- Field `type`: type spec=enum:kyc_type current=KycsType; default spec=driver_license current=KycsType.DRIVER_LICENSE
- Field `status`: type spec=enum:kyc_status current=KycsStatus; default spec=submitted current=KycsStatus.SUBMITTED
- Missing indexes: renter_id
- Missing relations: renter_id->renters
- Extra relations: renter_id->renter

### payments
- Missing fields: payment_id
- Field `method`: type spec=enum:payment_method current=PaymentMethod; default spec=unknown current=null
- Field `status`: type spec=enum:payment_status current=PaymentStatus; default spec=paid current=null
- Field `amount_paid`: type spec=Decimal128 current=number
- Field `paid_at`: default spec=Date.now current=null
- Field `provider_reference`: required spec=false current=true
- Indexes: ✅ Matches spec
- Missing relations: payment_id->fees

### pricings
- Missing fields: pricing_id
- Field `vehicle_id`: type spec=Types.ObjectId current=Vehicle
- Field `price_per_hour`: type spec=Decimal128 current=number
- Field `price_per_day`: type spec=Decimal128 current=number; required spec=false current=true
- Field `effective_from`: required spec=true current=false
- Field `deposit_amount`: type spec=Decimal128 current=number
- Field `late_return_fee_per_hour`: type spec=Decimal128 current=number
- Field `excess_mileage_fee`: type spec=Decimal128 current=number
- Missing indexes: effective_from, vehicle_id
- Missing relations: vehicle_id->vehicles
- Extra relations: vehicle_id->vehicle

### rentals
- Missing fields: rental_id, pickup_datetime
- Extra fields: pickup_date
- Field `booking_id`: type spec=Types.ObjectId current=Booking; unique spec=true current=false
- Field `vehicle_id`: type spec=Types.ObjectId current=Vehicle
- Field `expected_return_datetime`: required spec=false current=true
- Field `status`: type spec=enum:rental_status current=RetalStatus; default spec=reserved current=null
- Field `score`: required spec=true current=false; default spec=null current=0
- Missing indexes: vehicle_id
- Missing relations: booking_id->bookings | vehicle_id->vehicles | rental_id->contracts | rental_id->inspections
- Extra relations: booking_id->booking | vehicle_id->vehicle

### renters
- Missing fields: driver_license_no
- Extra fields: driver_license
- Field `user_id`: type spec=Types.ObjectId current=User; unique spec=true current=false
- Field `date_of_birth`: required spec=false current=true
- Field `address`: required spec=false current=true
- Field `risk_score`: required spec=false current=true
- Indexes: ✅ Matches spec
- Missing relations: user_id->users | user_id->bookings | user_id->kycs
- Extra relations: user_id->user

### reports
- Missing fields: report_id, inspection_id
- Extra fields: inspector_id
- Field `notes`: required spec=false current=true
- Field `damage_found`: default spec=false current=null
- Missing indexes: inspection_id
- Missing relations: report_id->reports_photo | inspection_id->inspections
- Extra relations: inspector_id->inspection

### reports_photo
- Status: ❌ Missing from codebase

### reports_photos
- Status: ⚠️ Only present in codebase (not defined in DBML)

### signatures
- Missing fields: signature_id, signer_ip
- Extra fields: signer_ip_address
- Field `contract_id`: type spec=Types.ObjectId current=string
- Field `role`: type spec=enum:party_role current=Role
- Field `signature_event`: type spec=enum:signature_event_type current=SignatureEvent; required spec=false current=true
- Field `type`: type spec=enum:signature_type current=SignatureType; default spec=digital_cert current=null
- Field `signed_at`: default spec=Date.now current=null
- Field `user_agent`: required spec=false current=true
- Field `provider_signature_id`: required spec=false current=true
- Field `signature_image_url`: required spec=false current=true
- Field `cert_subject`: required spec=false current=true
- Field `cert_issuer`: required spec=false current=true
- Field `cert_serial`: required spec=false current=true
- Field `cert_fingerprint_sha256`: required spec=false current=true
- Field `signature_hash`: required spec=false current=true
- Field `evidence_url`: required spec=false current=true
- Missing indexes: contract_id
- Missing relations: contract_id->contracts
- Extra relations: contract_id->contract

### staff
- Status: ❌ Missing from codebase

### staff_at_stations
- Field `staff_id`: type spec=Types.ObjectId current=Staff
- Field `start_time`: default spec=Date.now current=null
- Field `station_id`: type spec=Types.ObjectId current=Station
- Field `role_at_station`: required spec=false current=true
- Missing indexes: staff_id, start_time | end_time, staff_id | end_time, station_id
- Missing relations: station_id->stations
- Extra relations: station_id->station
- Relation [staff_id->staff]: type spec=belongsTo current=referencesOne; onDelete=cascade

### staff_transfers
- Missing fields: staff_transfer_id
- Field `staff_id`: type spec=Types.ObjectId current=Staff
- Field `from_station_id`: type spec=Types.ObjectId current=Station
- Field `to_station_id`: type spec=Types.ObjectId current=Station
- Field `approved_by_admin_id`: type spec=Types.ObjectId current=Admin
- Field `created_by_admin_id`: type spec=Types.ObjectId current=Admin
- Field `status`: type spec=enum:transfer_status current=StaffTransferStatus; default spec=draft current=StaffTransferStatus.DRAFT
- Missing indexes: staff_id, status | to_station_id
- Missing relations: from_station_id->stations | to_station_id->stations | created_by_admin_id->admins | approved_by_admin_id->admins
- Extra relations: from_station_id->station | to_station_id->station | approved_by_admin_id->admin | created_by_admin_id->admin
- Relation [staff_id->staff]: type spec=belongsTo current=referencesOne

### staffs
- Status: ⚠️ Only present in codebase (not defined in DBML)

### stations
- Missing fields: station_id
- Field `latitude`: type spec=number current=string; required spec=false current=true
- Field `longitude`: type spec=number current=string; required spec=false current=true
- Indexes: ✅ Matches spec
- Missing relations: station_id->staff_at_stations | station_id->vehicle_at_stations | station_id->vehicle_transfers | station_id->staff_transfers

### users
- Missing fields: user_id, created_at
- Extra fields: is_active
- Field `role`: type spec=enum:user_role current=string; default spec=unknown current=null
- Field `email`: unique spec=true current=false
- Indexes: ✅ Matches spec
- Missing relations: user_id->renters | user_id->staff | user_id->admins

### vehicle_at_stations
- Missing fields: vehicle_at_station_id
- Field `vehicle_id`: type spec=Types.ObjectId current=Vehicle
- Field `station_id`: type spec=Types.ObjectId current=Station
- Field `start_time`: default spec=Date.now current=null
- Field `end_time`: required spec=false current=true
- Field `current_battery_capacity_kwh`: required spec=false current=true
- Field `status`: type spec=enum:vehicle_at_stations_status_t current=StatusVehicleAtStation; required spec=false current=true
- Missing indexes: start_time, vehicle_id | end_time, vehicle_id | end_time, station_id
- Missing relations: vehicle_id->vehicles | station_id->stations | vehicle_at_station_id->bookings
- Extra relations: vehicle_id->vehicle | station_id->station

### vehicle_transfers
- Missing fields: vehicle_transfer_id
- Field `vehicle_id`: type spec=Types.ObjectId current=Vehicle
- Field `from_station_id`: type spec=Types.ObjectId current=Station
- Field `to_station_id`: type spec=Types.ObjectId current=Station
- Field `picked_up_by_staff_id`: type spec=Types.ObjectId current=number
- Field `dropped_off_by_staff_id`: type spec=Types.ObjectId current=number
- Field `approved_by_admin_id`: type spec=Types.ObjectId current=string
- Field `created_by_admin_id`: type spec=Types.ObjectId current=string
- Field `scheduled_pickup_at`: required spec=false current=true
- Field `scheduled_dropoff_at`: required spec=false current=true
- Field `status`: type spec=enum:transfer_status current=VehicleTransferStatus; default spec=draft current=VehicleTransferStatus.DRAFT
- Missing indexes: status | from_station_id, to_station_id
- Missing relations: from_station_id->stations | to_station_id->stations | created_by_admin_id->admins | approved_by_admin_id->admins | vehicle_id->vehicles
- Extra relations: vehicle_id->vehicle | from_station_id->station | to_station_id->station

### vehicles
- Missing fields: vehicle_id
- Field `category`: default spec=EV current=null
- Field `battery_capacity_kwh`: required spec=false current=true
- Field `range_km`: required spec=false current=true
- Field `vin_number`: required spec=false current=true
- Indexes: ✅ Matches spec
- Missing relations: vehicle_id->vehicle_at_stations | vehicle_id->rentals | vehicle_id->pricings | vehicle_id->vehicle_transfers
