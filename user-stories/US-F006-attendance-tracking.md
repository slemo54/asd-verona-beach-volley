# US-F006: Attendance Tracking

## Feature
F006 — Attendance Tracking

## Priority
critical

## User Story
As an admin, I want to record attendance for each training session so that presences and absences are accurately tracked.

## Optimal Path
1. Log in as admin
2. Navigate to Attendance page
3. Select the group to record
4. Select the training date
5. See the full list of athletes in that group
6. Mark each athlete as present or absent
7. For absent athletes, optionally flag "needs recovery"
8. Save the attendance record

## Edge Cases
- Session already recorded: Load existing records for update, do not create duplicate entries
- Athlete joined group mid-season: Only show athlete for sessions after their join date
- Athlete removed from group: Show in historical records but not in future sessions
- Swipe gesture on mobile: Swipe right marks present, swipe left marks absent

## Acceptance Criteria
- [ ] Admin can select a group and date to record attendance
- [ ] Each athlete appears with a present/absent toggle
- [ ] Admin can flag an absent athlete as "needs recovery"
- [ ] Saving updates counts without creating duplicate records (upsert)
- [ ] Athlete can view their own attendance history
- [ ] Swipe gesture works on mobile for marking attendance

## Test Notes
Mirrors the Excel Presenze sheet logic: S = present, N = absent. Attendance stored as one record per athlete per session (group + date + time_slot). needs_recovery is a boolean flag. Counts (total present, total absent) can be computed via aggregate queries rather than stored columns to avoid drift.
