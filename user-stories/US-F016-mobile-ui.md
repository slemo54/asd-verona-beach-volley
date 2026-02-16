# US-F016: Mobile-First UI & Brand Theme

## Feature
F016 — Mobile-First UI & Brand Theme

## Priority
high

## User Story
As an athlete, I want a mobile-optimized interface so I can manage everything from my phone.

## Optimal Path
1. Athlete opens the app on a mobile device and sees the VRB-branded login screen with gradient and logo
2. Athlete logs in and is taken to the home screen with a bottom navigation bar (Home, Calendar, Shop, Profile)
3. Athlete taps navigation items to switch between sections without full page reloads
4. Athlete uses swipe gestures where applicable (e.g., swipe to mark attendance)
5. VRB brand gradient (orange to magenta to purple) and Montserrat/Inter fonts are consistent throughout all screens

## Edge Cases

- **Desktop view:** On screens wider than the mobile breakpoint, bottom navigation is replaced by a sidebar navigation; layout adapts to the wider viewport.
- **Very small screen (320px):** All UI elements remain usable and readable at 320px width; no horizontal overflow or broken layouts.
- **Landscape mode:** Layout reflows correctly in landscape orientation; bottom nav remains accessible.
- **Slow connection (image optimization):** Product and profile images use lazy loading and responsive srcset; a loading skeleton is shown while images load.
- **Dark background logo vs light:** Logo (public/logo.png) renders correctly on both dark and light backgrounds where it appears across the app.

## Acceptance Criteria

- [ ] Bottom navigation bar (Home, Calendar, Shop, Profile) is displayed on mobile viewports
- [ ] All interactive touch targets are at minimum 44x44px
- [ ] VRB brand gradient (#F97316 -> #EC4899 -> #7C3AED) is applied consistently to headers, buttons, and accent elements
- [ ] VRB logo is present in the app header on all pages; logo file is located at public/logo.png
- [ ] Responsive sidebar navigation replaces bottom nav on desktop viewports
- [ ] Swipe gesture support is implemented for relevant interactions (e.g., attendance marking)
- [ ] Images use lazy loading throughout the app
- [ ] Body text uses Inter font; headings use Montserrat font
- [ ] App is usable and visually correct at 320px minimum width

## Test Notes
Brand: VRB gradient orange (#F97316) -> magenta (#EC4899) -> purple (#7C3AED). Background: black. Logo: Arena di Verona + beach volleyball player silhouette. Copy logo to public/logo.png before testing. Use Chrome DevTools device emulator to test at 320px, 375px (iPhone SE), 390px (iPhone 14), and 768px (tablet). Test bottom nav vs sidebar breakpoint transition. Verify touch targets with accessibility inspector.
