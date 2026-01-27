

# PDF-Only Certificate Verification

## Overview
Modify the certificate verification system to **only accept PDF files** and reject photo/image uploads (JPG, PNG, etc.). This will require changes to both the frontend validation and the backend Edge Function.

## Current Behavior
- Frontend accepts: PDF, JPG, JPEG, PNG files
- Images are converted to base64 and sent to AI for vision-based verification
- PDFs are uploaded but not analyzed by AI (only text-based verification)

## New Behavior
- Frontend will **only accept PDF files**
- Photo uploads (JPG, PNG, etc.) will be **immediately rejected** with a clear error message
- PDFs will be stored and verified using text-based AI verification
- UI text will be updated to reflect PDF-only support

---

## Implementation Steps

### Step 1: Update Frontend File Validation (Verify.tsx)

**File type restrictions:**
- Change the `accept` attribute on the file input to only allow `.pdf`
- Add validation in `handleDrop` and `handleFileChange` to reject non-PDF files with a toast error
- Update the UI info box to indicate **PDF only** (remove JPG/PNG mentions)

**Validation logic:**
```
const ALLOWED_TYPES = ['application/pdf'];
const ALLOWED_EXTENSIONS = ['pdf'];

// Check both MIME type and extension for security
if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(extension)) {
  toast.error("Only PDF files are accepted. Please upload a PDF certificate.");
  return;
}
```

### Step 2: Update Verify Button Logic

Since PDFs cannot be converted to base64 images for vision analysis:
- Remove the image-to-base64 conversion logic
- Always send `imageBase64: null` to the Edge Function
- The AI will use text-based verification for PDF submissions

### Step 3: Update Backend Edge Function (verify-certificate)

Add server-side validation for file type:
- Update the Zod schema to add a `fileType` field
- Validate that only PDFs are being processed
- Return a clear error for rejected file types
- Update the AI prompt to clarify that verification is based on metadata only (no image analysis for PDFs)

### Step 4: Update UI Copy

Update user-facing text to reflect PDF-only support:
- Upload area: "Drag and drop your certificate PDF here"
- Subtext: "or click to browse (PDF only)"
- Info box: "We accept PDF files up to 10MB..."

---

## Technical Details

### Frontend Changes (`src/pages/Verify.tsx`)

1. **File input accept attribute**: Change from `.pdf,.jpg,.jpeg,.png` to `.pdf`

2. **New validation helper function**:
   - `validateFileType(file: File)` - returns boolean and shows toast on failure

3. **Update handlers**:
   - `handleDrop`: Add file type validation before setting file
   - `handleFileChange`: Add file type validation before setting file
   - `handleVerify`: Remove image base64 conversion, always pass null

4. **UI text updates**:
   - Upload prompt text
   - Info box content

### Backend Changes (`supabase/functions/verify-certificate/index.ts`)

1. **Update Zod schema**: Add optional `fileType` field for additional validation

2. **Update AI system prompt**: Clarify that for PDF uploads, verification is based on provided metadata (title, issuer) since the PDF content cannot be directly analyzed

3. **Improve text-only verification response**: Make it clearer that the certificate has been accepted and will be manually reviewable

---

## User Experience Flow

1. User visits `/verify`
2. User drags/drops or selects a file
3. If **PDF**: File is accepted, success state shown
4. If **JPG/PNG/other**: File is rejected with error toast: "Only PDF files are accepted. Please upload a PDF certificate."
5. User fills in title and issuer
6. User clicks "Verify Certificate"
7. System performs text-based AI verification
8. User is redirected to success/failed page based on result

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Verify.tsx` | File validation, UI text, remove image conversion |
| `supabase/functions/verify-certificate/index.ts` | Update AI prompt for PDF-only verification |

