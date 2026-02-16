# US-F007: Recovery System

## Feature
F007 — Recovery System

## Priority
critical

## User Story
As an athlete, I want to book a recovery session in another group so that I can make up missed training at my own level.

## Optimal Path
1. Log in as athlete
2. Navigate to Recovery page
3. See pending recovery count (e.g. "3 recoveries needed")
4. Browse available groups filtered by same level
5. See availability (spots remaining per session)
6. Select a session and book it
7. Receive confirmation
8. See recovery count updated (pending decremented)

## Edge Cases
- No same-level groups available: Show message "No recovery slots available at your level this week"
- Target group full (at max_athletes): Show slot as unavailable, disable booking button
- Athlete has no pending recoveries: Recovery page shows "All caught up", booking disabled
- Athlete tries to book in a different level group: Block action with explanation "Level must match your group"
- Recovery already booked for that date: Show error "You already have a recovery booked on this date"

## Acceptance Criteria
- [ ] Athlete can see the number of pending recoveries
- [ ] Recovery slot list is filtered to same level as athlete's primary group
- [ ] Slots at max capacity are shown as unavailable and cannot be booked
- [ ] Athlete can book an available recovery slot
- [ ] Completed recovery is tracked and deducted from pending count
- [ ] Admin can view all recovery bookings across all athletes

## Test Notes
Self-service flow — no admin approval required. Level matching is mandatory and enforced in both UI and database query (RLS or server-side check). max_athletes is enforced by checking current bookings + group roster count before confirming. Recovery records stored in a recoveries or recovery_bookings table linked to athlete, group, and session date.
