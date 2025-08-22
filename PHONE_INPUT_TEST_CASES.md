# Phone Input Fix Test Cases

## 🔧 Issue Fixed
**Problem**: Typing any number was resulting in "9191919191" due to incorrect 91 prefix handling.

**Solution**: Fixed the logic in PhoneInput component to properly handle 91 prefix removal.

## 🧪 Test Cases

### Test 1: Normal 10-digit number
**Input**: `9876543210`
**Expected Display**: `+91-9876543210`
**Expected Storage**: `9876543210`
**Status**: ✅ Should work

### Test 2: Number with 91 prefix (12 digits)
**Input**: `919876543210`
**Expected Display**: `+91-9876543210`
**Expected Storage**: `9876543210`
**Status**: ✅ Should work (91 prefix removed)

### Test 3: Copy-paste full Indian number
**Input**: `+919876543210`
**Expected Display**: `+91-9876543210`
**Expected Storage**: `9876543210`
**Status**: ✅ Should work

### Test 4: Short number starting with 91
**Input**: `9187654`
**Expected Display**: `+91-9187654`
**Expected Storage**: `9187654`
**Status**: ✅ Should work (91 not treated as prefix)

### Test 5: Invalid starting digit
**Input**: `1234567890`
**Expected Display**: `+91-1234567890`
**Expected Storage**: `1234567890`
**Expected Validation**: ❌ "Please enter a valid Indian mobile number"
**Status**: ✅ Should show validation error

### Test 6: Empty input
**Input**: `` (empty)
**Expected Display**: `` (empty)
**Expected Storage**: `` (empty)
**Expected Validation**: ❌ "Contact number is required"
**Status**: ✅ Should show validation error

### Test 7: Letters and numbers
**Input**: `abc9876543210`
**Expected Display**: `+91-9876543210`
**Expected Storage**: `9876543210`
**Status**: ✅ Should work (letters filtered out)

## 🔍 How to Test

1. **Open Add Exhibitor Form**
2. **Navigate to Step 1 (Personal Information)**
3. **Try each test case in the Contact Number field**
4. **Verify the display format and validation**
5. **Check that navigation works properly**

## ✅ Expected Behavior

### Display Format:
- Always shows `+91-XXXXXXXXXX`
- Automatically formats as you type
- Maximum 10 digits after +91-

### Storage:
- Only stores the 10 digits (no prefix)
- Example: stores `9876543210` not `+919876543210`

### Validation:
- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9
- Clear error messages for invalid input

### Edge Cases Handled:
- ✅ 91 prefix removal when appropriate
- ✅ Character filtering (only numbers)
- ✅ Length limiting (max 10 digits)
- ✅ Copy-paste handling
- ✅ Validation integration

## 🚨 Before Fix vs After Fix

### Before (Broken):
- Input: `9876543210` → Display: `+91-9191919191` ❌
- Input: `919876543210` → Display: `+91-9191919191` ❌

### After (Fixed):
- Input: `9876543210` → Display: `+91-9876543210` ✅
- Input: `919876543210` → Display: `+91-9876543210` ✅

The phone input now works correctly without duplicating the 91 prefix! 