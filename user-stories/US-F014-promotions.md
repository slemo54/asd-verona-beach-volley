# US-F014: Promotions & Partnerships

## Feature
F014 — Promotions & Partnerships

## Priority
medium

## User Story
As an athlete, I want to see active promotions and partner discounts so I can take advantage of deals.

## Optimal Path
1. Athlete logs in and lands on the dashboard
2. System displays a promotion banner for any currently active promotion
3. Athlete clicks the banner to see full promotion details (partner name, discount description, validity period, instructions to redeem)
4. Athlete navigates to the Shop page and sees active promotions highlighted on relevant products or in a dedicated promotions section

## Edge Cases

- **No active promotions:** Dashboard shows no promotion banner; the promotions section on the Shop page is hidden or displays an empty state — no errors.
- **Expired promotion auto-hidden:** A promotion whose validity end date has passed is automatically excluded from all views without manual admin intervention.
- **Promotion without partner:** Admin creates a promotion not linked to a specific partner (e.g., a general discount) — system displays the promotion without partner info; no broken layout.
- **Multiple active promotions:** More than one promotion is active simultaneously — dashboard shows all active banners (or a carousel), and all are highlighted in the Shop.

## Acceptance Criteria

- [ ] Admin can create, edit, and deactivate promotions with a title, description, discount type (percentage or fixed amount), validity start/end dates, and optional partner info
- [ ] Active promotions (within validity period) are displayed on the athlete dashboard as banners
- [ ] Clicking a promotion banner shows full detail: partner info, discount value/type, validity period, redemption instructions
- [ ] Active promotions are highlighted in the Shop page
- [ ] Expired promotions are automatically hidden from all athlete-facing views (no manual action required)
- [ ] Admin-only: create, edit, delete promotions

## Test Notes
Test by creating a promotion with an end date in the past and verifying it does not appear. Test with no promotions at all. Test with two simultaneous active promotions to verify multiple banners render correctly. Discount types to support: percentage (e.g., 10%) and fixed amount (e.g., 5 EUR). Validity is determined by comparing current date against start_date and end_date fields.
