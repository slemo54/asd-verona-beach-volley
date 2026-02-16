# US-F005: Training Calendar

## Feature
F005 — Training Calendar

## Priority
critical

## User Story
As an athlete, I want to see the weekly training schedule so that I know when and where to train.

## Optimal Path
1. Log in as athlete
2. Navigate to Calendar page
3. See the current week displayed Monday through Friday
4. See own group's sessions highlighted distinctly
5. Navigate to next week using arrow/button
6. See future scheduled sessions

## Edge Cases
- No sessions this week: Show empty state message "No sessions scheduled this week"
- Athlete in multiple groups: All associated group sessions are highlighted
- Admin creates a session for a past date: Warn admin but allow if intentional (for attendance correction)
- Weekend: Saturday and Sunday columns are hidden or shown as empty/non-interactive

## Acceptance Criteria
- [ ] Calendar shows Monday to Friday view for the current week
- [ ] Each time slot (18:30-20:00, 20:00-21:30) is visible per day
- [ ] All groups assigned to a slot are listed within that slot
- [ ] Athlete's own group sessions are visually highlighted
- [ ] Admin can create, edit, and delete training sessions
- [ ] Week navigation allows moving forward and backward in time

## Test Notes
Two time slots per day: 18:30-20:00 and 20:00-21:30. Sessions are tied to group + date + time_slot. The calendar view is read-only for athletes. Admin session creation should propagate to the attendance table (pre-populate athlete list for that session).
