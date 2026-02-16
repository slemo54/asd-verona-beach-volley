# US-F013: Shopping Cart & Orders

## Feature
F013 — Shopping Cart & Orders

## Priority
high

## User Story
As an athlete, I want to add products to a cart and place an order so I can get my team gear.

## Optimal Path
1. Athlete browses the Shop page and selects a product with a size
2. Athlete clicks "Add to Cart" — the cart badge in the header updates to reflect the new item count
3. Athlete navigates to the Cart page and reviews all items (product name, size, quantity, unit price, line total)
4. Athlete adjusts quantities or removes items as needed
5. Athlete clicks "Place Order"
6. System validates the order (athlete not moroso, cart not empty, all items still available)
7. System creates the order record and displays a confirmation page with the order ID and summary
8. Athlete can view the order in their order history with current status

## Edge Cases

- **Moroso athlete blocked from ordering:** Athlete flagged as moroso attempts to place an order — system shows a blocking error message and prevents checkout; browsing the shop remains allowed.
- **Empty cart submission:** Athlete navigates directly to checkout with an empty cart — system shows an "Your cart is empty" message and disables the Place Order button.
- **Product removed while in cart:** A product is deleted by admin while it is in the athlete's cart — at checkout, system warns the athlete that the item is no longer available and removes it from the cart automatically.
- **Size out of stock:** A size becomes out of stock between add-to-cart and checkout — system flags the item and prevents order placement until the item is removed or replaced.
- **Modify quantity to 0:** Athlete sets item quantity to 0 in the cart — item is automatically removed from the cart.
- **Admin updates order status:** Admin changes an order status (e.g., from "pending" to "fulfilled") — status update is reflected immediately in the athlete's order history.

## Acceptance Criteria

- [ ] Athlete can add products (with selected size) to the cart from any product page
- [ ] Cart badge/icon in the header updates in real time to show current item count
- [ ] Cart page displays all items with name, size, quantity, unit price, and line total
- [ ] Athlete can modify item quantities and remove items from the cart
- [ ] Non-moroso athlete can successfully place an order and receives a confirmation with order ID
- [ ] Moroso athletes are blocked from placing orders with a clear error message
- [ ] Order is saved to the database and appears in the athlete's order history
- [ ] Admin can view all orders and update their status (pending, fulfilled, cancelled)
- [ ] Cart state is persisted via Zustand store (survives page refresh within the session)

## Test Notes
Cart state is managed with Zustand. No online payment in v1 — orders are fulfilled manually. Test moroso block by flagging a test athlete as moroso in Supabase. Verify that the cart badge updates without a full page reload. Test concurrent stock updates to verify the out-of-stock edge case during checkout. Simulate product deletion mid-session to confirm cart cleanup behavior.
