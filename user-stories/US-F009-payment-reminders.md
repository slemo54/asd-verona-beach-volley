# US-F009: Payment Reminders & Morosity Block

## Feature
F009 — Payment Reminders & Morosity Block

## Priority
high

## User Story
As an admin, I want overdue athletes to receive automatic reminders and be blocked from bookings so that timely payment is encouraged.

## Optimal Path
1. Athlete with overdue balance (amount_paid = 0) logs in
2. Sees a persistent warning banner: "Payment overdue — please contact the club"
3. Attempts to book a recovery session or court
4. Sees the booking button disabled with tooltip explanation: "Booking unavailable due to outstanding balance"
5. Receives a weekly automated email reminder about the overdue amount
6. Once payment is recorded by admin, morosity lifts immediately and bookings re-enable

## Edge Cases
- Admin overrides morosity: Admin can manually mark athlete as non-moroso regardless of balance, with a note
- Athlete pays and morosity lifts immediately: After admin records payment, re-query on next action shows green, no cache lag
- Athlete with zero balance sees no warning: No banner, no restrictions
- Partial payment (yellow status): Athlete is NOT moroso, can still book, but sees informational banner
- New athlete with no payment record: Treated as red/overdue until first payment recorded

## Acceptance Criteria
- [ ] Warning banner is shown on every page for moroso athletes (overdue status)
- [ ] Weekly email cron sends reminder to all moroso athletes with outstanding balance
- [ ] Moroso athletes are blocked from booking recovery sessions
- [ ] Moroso athletes are blocked from court/other bookings (if applicable)
- [ ] Block is enforced at both UI level (disabled buttons) and RLS/server level
- [ ] Admin can override morosity status with a manual flag and audit note
- [ ] Lifting morosity (via payment or override) takes effect immediately

## Test Notes
Morosity definition: status = "overdue" triggered when amount_paid = 0 and season has started. Partial payments (yellow) are NOT moroso — athlete retains booking rights. Weekly email cron recommended via Supabase Edge Functions + pg_cron or external scheduler (e.g. Vercel Cron). RLS policy on bookings table must check morosity status before allowing insert. Admin override stored as a boolean field (morosity_override) with override_note and override_by columns on the profiles or payments table.
