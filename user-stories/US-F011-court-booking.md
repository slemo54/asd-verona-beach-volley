# US-F011: Court Booking System

## Feature
F011 — Court Booking System

## Priority
high

## User Story
As an athlete, I want to book a beach volley court on Saturday so I can play with friends.

## Optimal Path
1. Athlete logs in and navigates to the Booking page
2. System displays a calendar or date picker showing only upcoming Saturday dates
3. Athlete selects a Saturday date
4. System shows available time slots and courts for that date
5. Athlete selects a court and a time slot
6. Athlete confirms the booking
7. System saves the booking and displays a confirmation message with booking details (court name, date, time slot, booking ID)

## Edge Cases

- **Moroso athlete blocked:** An athlete flagged as moroso (overdue payment) attempts to book — system displays an error message explaining the block and directs them to the admin.
- **Double-booking prevented:** An athlete or second user tries to book the same court, date, and time slot already taken — system returns a conflict error; the UNIQUE constraint on (court_name, booking_date, time_slot) enforces this at the database level.
- **Cancel own booking:** Athlete cancels their own upcoming booking — system removes the booking and the slot becomes available again.
- **Admin cancels booking:** Admin cancels any athlete's booking from the management view — booking is removed and athlete receives a notification (or sees updated status on next login).
- **No courts available:** All slots for the selected Saturday are fully booked — system shows a "No slots available" message and suggests other dates.
- **Booking in the past:** Athlete attempts to select a past Saturday date — system disables past dates in the picker; if bypassed via API, request is rejected with a validation error.

## Acceptance Criteria

- [ ] Booking page shows only Saturday dates in the date picker/calendar
- [ ] Available slots are displayed per court and time for the selected Saturday
- [ ] Athlete can successfully book an available court and time slot
- [ ] System prevents double-booking via UNIQUE constraint on (court_name, booking_date, time_slot)
- [ ] Moroso athletes are blocked from making new bookings with a clear error message
- [ ] Athlete can cancel their own upcoming bookings
- [ ] Admin can view and cancel any booking from the management interface
- [ ] Booking confirmation is shown immediately after a successful reservation

## Test Notes
Saturday-only restriction must be enforced both in the UI (disabled dates) and at the API/database level. Test the UNIQUE constraint directly via Supabase with concurrent requests to simulate race conditions. Create a test moroso athlete account to verify the block. Verify past-date bookings are rejected by the API even if the UI restriction is bypassed.
