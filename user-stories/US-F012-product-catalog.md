# US-F012: E-Commerce Product Catalog

## Feature
F012 — E-Commerce Product Catalog

## Priority
high

## User Story
As an athlete, I want to browse VRB merchandise so I can buy team gear.

## Optimal Path
1. Athlete logs in and navigates to the Shop page
2. System displays a product grid with all available merchandise (VRB T-shirt White, VRB T-shirt Black, VRB Sweatshirt Black)
3. Athlete uses the category filter to narrow results (e.g., selects "tshirt")
4. System updates the grid to show only products matching the selected category
5. Athlete clicks on a product to open the detail page
6. System shows product images, full description, available sizes (S, M, L, XL, XXL), and price
7. Athlete selects a size and adds the product to the cart

## Edge Cases

- **Product out of stock:** Product or specific size is out of stock — system displays an "Out of stock" indicator; the size selector option is disabled and cannot be added to cart.
- **No products in category:** Selected category has no products — system shows an empty state message (e.g., "No products in this category yet") instead of a blank grid.
- **Product with no sizes:** A product is created without size options — system shows the product but disables the Add to Cart button with a "Size unavailable" message.
- **Image loading error:** A product image fails to load — system shows a branded placeholder image instead of a broken image icon.
- **Admin creates product without image:** Admin saves a new product without uploading an image — system accepts the product but renders the placeholder image on the catalog and detail pages.

## Acceptance Criteria

- [ ] Shop page displays all active products in a responsive grid layout
- [ ] Each product card shows name, image, price, and category
- [ ] Category filter (tshirt, sweatshirt, accessory) correctly filters the product grid
- [ ] Product detail page shows images, description, size selector (S–XXL), and price
- [ ] Admin can create, edit, and delete products via the admin interface
- [ ] Product images are stored in Supabase Storage and served via public URL
- [ ] Out-of-stock products and sizes are visually indicated and cannot be added to cart
- [ ] Initial product seed includes: VRB T-shirt White, VRB T-shirt Black, VRB Sweatshirt Black

## Test Notes
Seed database with the three initial products before testing. Verify Supabase Storage bucket policies allow public read access for product images. Test category filter with empty categories. Confirm that admin CRUD operations update the catalog immediately (no stale cache). Test image fallback by using an invalid image URL in a product record.
