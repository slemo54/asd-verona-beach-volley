# US-F002: Athlete Profile Management

## Feature
F002 — Athlete Profile Management

## Priority
critical

## User Story
As an athlete, I want to manage my profile so that my personal information is always up to date.

## Optimal Path
1. Log in as athlete
2. Navigate to Profile page
3. See current personal data (name, phone, t-shirt size, etc.)
4. Click Edit
5. Update name, phone number, or t-shirt size
6. Save changes
7. See updated data reflected immediately

## Edge Cases
- Empty required fields: Show validation error, prevent save
- Invalid phone format: Show inline error with expected format hint
- Avatar upload too large: Show error "File must be under 2MB", do not upload
- Admin editing another athlete's profile: Allowed via admin panel with audit trail

## Acceptance Criteria
- [ ] Athlete can view their own profile
- [ ] Athlete can edit name, phone number, and t-shirt size
- [ ] Athlete cannot view or edit another athlete's profile
- [ ] Admin can view and edit any athlete's profile
- [ ] Changes persist after saving and page refresh
- [ ] T-shirt size dropdown offers: XS, S, M, L, XL, XXL

## Test Notes
RLS enforced at Supabase level: profiles table policy restricts reads/writes to own row for athletes. Admin bypass via role check. T-shirt sizes stored as enum or constrained text field.
