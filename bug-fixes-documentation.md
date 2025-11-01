# API Bug Fixes Documentation

**Date**: November 1, 2025  
**Updated by**: API Testing and Bug Fix Process  

## Critical Issues Fixed

### 1. Server Error: "Cannot read properties of undefined (reading 'toString')" ✅ FIXED

**Location**: Multiple payment and booking endpoints  
**Root Cause**: Missing null checks before calling `.toString()` on MongoDB ObjectIds  
**Files Fixed**:
- `src/modules/payments/cash/cash.service.ts`
- `src/modules/bookings/booking.service.ts`  
- `src/modules/payments/base/abstract-payment.service.ts`

**Changes Made**:
```typescript
// Before (causing error):
booking._id.toString()
booking.vehicle_id.toString()

// After (with validation):
if (!booking._id) {
  throw new NotFoundException("Booking ID not found");
}
if (!booking.vehicle_id) {
  throw new BadRequestException("Vehicle ID is missing from booking");
}
booking._id.toString()
booking.vehicle_id.toString()
```

**Impact**: Fixed 500 errors in booking confirmation and payment confirmation endpoints

### 2. DTO Validation Issues ✅ FIXED

**Location**: User and Auth DTOs  
**Root Cause**: Missing `@IsOptional()` decorators and duplicate `@ApiProperty` decorators  

#### 2a. Duplicate ApiProperty Decorator
**File**: `src/modules/auth/dto/renter.dto.ts`
```typescript
// Before (duplicate decorators):
@ApiProperty({
  description: "Driver license number of the renter (optional)",
  example: "123456789",
  required: false,
})
@ApiProperty({
  description: "Address of the renter (optional)",
  example: "123 FPT",
  required: false,
})

// After (removed duplicate):
@ApiProperty({
  description: "Address of the renter (optional)",
  example: "123 FPT",
  required: false,
})
```

#### 2b. Optional Fields Not Properly Validated
**File**: `src/modules/users/dto/user.dto.ts`
```typescript
// Before (missing @IsOptional):
@ApiProperty({ description: "Phone number", example: "0901234567", required: false })
@IsString()
phone?: string;

// After (with @IsOptional):
@ApiProperty({ description: "Phone number", example: "0901234567", required: false })
@IsOptional()
@IsString()
phone?: string;
```

**Impact**: Fixed validation errors where optional fields were being required

## Testing Results After Fixes

### Fixed Endpoints Status:
| Endpoint | Before Fix | After Fix | Status |
|----------|------------|-----------|--------|
| PATCH `/payments/confirm-cash/:id` | ❌ 500 Error | ✅ Working | Fixed |
| PATCH `/bookings/confirm/:id` | ❌ 500 Error | ✅ Working | Fixed |
| PUT `/users/update-renter/:id` | ⚠️ Required optional fields | ✅ Working | Fixed |
| POST `/auth/register/renter` | ⚠️ Duplicate decorator issue | ✅ Working | Fixed |
| DELETE `/contracts/:id` | ❌ Not Tested | ✅ Working | Tested & Working |

### Remaining Issues (Not Critical):

1. **Complex Booking Validation**: Still requires exact amount calculations and vehicle availability checks
2. **MoMo Signature Validation**: Returns expected error for invalid signatures (working as intended)
3. **File Upload Endpoints**: Not tested (multipart/form-data endpoints)

## Code Quality Improvements

### Error Handling
- Added comprehensive null checks before calling `.toString()` on ObjectIds
- Improved error messages with specific context
- Added validation for required fields in business logic

### DTO Validation
- Removed duplicate decorators that could cause confusion
- Made optional fields truly optional with proper validation decorators
- Improved API documentation consistency

### Type Safety
- Added proper type guards for MongoDB document IDs
- Improved TypeScript type assertions for better compile-time checking

## Testing Recommendations

1. **Automated Tests**: Add unit tests for the fixed validation logic
2. **Integration Tests**: Test payment and booking workflows end-to-end
3. **Error Handling Tests**: Verify proper error responses for edge cases
4. **File Upload Tests**: Test multipart endpoints with actual file uploads

## Deployment Notes

**Safe to Deploy**: ✅ All fixes are backward compatible  
**Database Changes**: ❌ None required  
**Environment Variables**: ❌ None changed  
**Dependencies**: ❌ None added or changed  

## Performance Impact

- **Positive**: Eliminated runtime crashes that could cause service downtime
- **Minimal**: Added validation checks have negligible performance overhead
- **Improved**: Better error handling reduces unnecessary processing

## Next Steps

1. Deploy fixes to staging environment
2. Run full regression test suite
3. Test file upload endpoints specifically
4. Monitor error rates in production
5. Consider adding helper endpoints for amount calculation