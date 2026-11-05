# PDF-Only Certificate Verification Plan

## Overview
Specification for the certificate verification system to **only accept PDF files** and reject photo/image uploads (JPG, PNG, etc.).

## Verification Flow
- Frontend accepts: PDF documents only (`.pdf`)
- Direct metadata and cryptographic hash verification against institutional database
- Clear user feedback and error messages for unsupported file formats
- Tamper detection and transparent trust scoring

## Implementation Details

### 1. Frontend File Validation (`src/pages/Verify.tsx`)
- Restrict `accept` attribute on file inputs to `.pdf`
- Validate MIME type (`application/pdf`) and file extension on drop or browse
- Immediate toast feedback for non-PDF files

### 2. Verification Processing
- Hash computation and metadata extraction
- Safe storage upload in `certificates` bucket
- Immediate verification lookup against registered institutional credentials
