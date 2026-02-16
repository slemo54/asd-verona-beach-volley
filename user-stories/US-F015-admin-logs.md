# US-F015: Admin Audit Logs

## Feature
F015 — Admin Audit Logs

## Priority
medium

## User Story
As an admin, I want to see a log of all admin actions so there's accountability and traceability.

## Optimal Path
1. Admin navigates to the Logs page from the admin panel
2. System displays a paginated list of recent admin actions, sorted by timestamp descending
3. Admin applies a date range filter to narrow results to a specific period
4. Admin applies an action type filter (e.g., "create_athlete", "update_payment") to see only relevant entries
5. Admin clicks on a log entry to see full details: timestamp, admin user, action type, affected entity, and any changed values

## Edge Cases

- **No logs yet:** Logs page shows an empty state message ("No actions logged yet") — no errors or broken layout.
- **Very old logs (pagination):** Log list uses pagination to handle large volumes; older entries are accessible by navigating through pages.
- **Filter returns no results:** Active filters match no log entries — system shows an empty state message ("No results for these filters") rather than an error.
- **Non-admin tries to access:** An athlete or unauthenticated user navigates to the Logs page — system redirects them with an "Access denied" message; RLS policies block direct API access.

## Acceptance Criteria

- [ ] Every admin action is automatically logged with: timestamp, admin user ID, action type, entity type, entity ID, and relevant changed values
- [ ] Logs page is filterable by date range, action type, and entity type
- [ ] Log entries include at minimum: move_athlete, create_group, update_payment, create_athlete actions
- [ ] Logs are append-only — no edit or delete operations are possible on log records (enforced at DB level via RLS)
- [ ] Logs page is accessible only to admins; non-admins are redirected
- [ ] Pagination is implemented for large log volumes

## Test Notes
Logs are read-only — verify via Supabase RLS that INSERT is allowed but UPDATE and DELETE are blocked for the logs table for all roles. Perform several admin actions (create athlete, move athlete, update payment) and verify all appear in the log. Test date range and action type filters. Test direct API access with an athlete JWT to confirm 403/redirect behavior.
