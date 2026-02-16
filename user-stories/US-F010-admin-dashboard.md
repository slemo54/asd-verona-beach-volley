# US-F010: Admin Dashboard

## Feature
F010 — Admin Dashboard

## Priority
critical

## User Story
As an admin, I want a dashboard overview so I can quickly see the state of the organization.

## Optimal Path
1. Admin navigates to the login page and signs in with admin credentials (asdveronabeachvolley@gmail.com / 2626)
2. System authenticates the admin and redirects to the dashboard
3. Admin sees summary cards displaying: total athletes, number of groups, overdue payments count, expiring certificates count, and pending orders count
4. Admin clicks a summary card (e.g., "Overdue Payments") to navigate to the corresponding detail view
5. Admin uses the search field to find a specific athlete by name or group
6. Admin accesses the CSV import feature to bulk-import athlete data
7. System processes the CSV, reports success count and any validation errors

## Edge Cases

- **Zero athletes:** Dashboard shows all summary cards with count 0; no errors or broken layouts.
- **No overdue payments:** Overdue payments card displays 0 and renders in green (all-clear state) rather than red.
- **Very large number of athletes:** Athlete list views use pagination (e.g., 25 per page) to avoid performance issues.
- **CSV with invalid data:** Import reports which rows failed validation (missing name, invalid date, unknown group) and imports only valid rows; partial imports are allowed.

## Acceptance Criteria

- [ ] Dashboard displays summary cards with correct real-time counts: total athletes, groups, overdue payments, expiring certificates, pending orders
- [ ] Each summary card links to the corresponding detail/management page
- [ ] Athlete search filters results by name and/or group in real time
- [ ] CSV bulk import accepts a file, validates rows, imports valid records, and returns a summary report (success/failure counts)
- [ ] Dashboard is accessible only to users with admin role; non-admins are redirected
- [ ] All admin actions performed from the dashboard are recorded in the audit log

## Test Notes
Login credentials: asdveronabeachvolley@gmail.com / 2626. Test with a Supabase seed that includes athletes in various states (moroso, expiring certificate, pending order). Verify RLS policies block non-admin access to the dashboard route.
