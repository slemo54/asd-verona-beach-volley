# US-F003: Medical Certificate Management

## Feature
F003 — Medical Certificate Management

## Priority
critical

## User Story
As an athlete, I want to upload my medical certificate so that the club has my documents on file and I can participate in training.

## Optimal Path
1. Go to Profile page
2. Click "Upload Certificate" button
3. Select a PDF, JPG, or PNG file from device
4. Choose certificate type: agonistico or non agonistico
5. Set expiry date using date picker
6. Click Upload
7. See green semaphore indicator confirming valid certificate

## Edge Cases
- File too large (>5MB): Show error "File must be under 5MB", block upload
- Wrong file type: Show error "Only PDF, JPG, PNG accepted", block upload
- Expired certificate uploaded: Accept file but semaphore shows red immediately
- No certificate uploaded: Semaphore shows red (missing document)
- Expiring within 30 days: Semaphore shows yellow as early warning
- Admin views all: Admin can see certificate status for every athlete in a list view

## Acceptance Criteria
- [ ] Athlete can upload a certificate file (PDF, JPG, PNG, max 5MB)
- [ ] Certificate type is selectable: agonistico / non agonistico
- [ ] Expiry date is mandatory and stored correctly
- [ ] Semaphore shows green (valid), yellow (expiring ≤30 days), red (expired or missing)
- [ ] Admin can view certificate status for all athletes
- [ ] Daily cron job re-evaluates semaphore statuses based on current date
- [ ] File is stored in Supabase Storage with access restricted to owner and admin

## Test Notes
Semaphore logic mirrors the Excel P column formula: green if expiry > today+30, yellow if today < expiry <= today+30, red if expiry <= today or no certificate. Max file size: 5MB. Accepted MIME types: application/pdf, image/jpeg, image/png. Cron should run nightly (e.g. 00:00 UTC).
