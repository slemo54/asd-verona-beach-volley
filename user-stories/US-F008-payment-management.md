# US-F008: Payment Management

## Feature
F008 — Payment Management

## Priority
critical

## User Story
As an admin, I want to track athlete payments so that I know who has paid their season fee and who still owes money.

## Optimal Path
1. Log in as admin
2. Navigate to Payments page
3. See all athletes listed with their payment semaphore (green/yellow/red)
4. Click on a specific athlete
5. See full payment details: season fee, amount paid, balance, payment history
6. Record a new payment with amount, method, and date
7. Balance updates automatically
8. Semaphore changes to reflect new status

## Edge Cases
- Overpayment: Balance goes negative (credit), display as "credit" not "overdue"
- Zero season fee: Athlete is immediately green with no payment required
- Multiple payment methods in same season: Each transaction stored separately with its method
- PayPal vs bonifico vs contanti: All three methods supported and labeled in transaction history
- Transaction history: All payments listed in chronological order with edit capability for admin

## Acceptance Criteria
- [ ] Admin can create a payment record for an athlete (amount, method, date, notes)
- [ ] Admin can record partial payments; multiple payments accumulate toward season fee
- [ ] Remaining balance is auto-calculated: season_fee + association_fee - amount_paid
- [ ] Semaphore: green = fully paid, yellow = partial payment, red = no payment / overdue
- [ ] Athlete can view their own payment status and transaction history (read only)
- [ ] Admin overview shows all athletes with semaphore sorted by status

## Test Notes
Season fees range from 480 to 860 EUR depending on category. Association fee: 15 EUR (mandatory). Payment methods: bonifico bancario, PayPal, contanti. Payments table: athlete_id, amount, method, date, notes, recorded_by (admin). Balance computed via SUM query, not a stored field, to prevent drift. Semaphore thresholds: paid >= total_due → green; 0 < paid < total_due → yellow; paid = 0 → red.
