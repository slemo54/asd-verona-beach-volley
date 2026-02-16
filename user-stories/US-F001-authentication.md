# US-F001: Authentication System

## Feature
F001 — Authentication System

## Priority
critical

## User Story
As an athlete or admin, I want to log in with email and password so that I can access the platform securely.

## Optimal Path
1. Open app in browser
2. See login page (unauthenticated redirect)
3. Enter email and password
4. Click login button
5. Redirected to dashboard (athlete → athlete dashboard, admin → admin dashboard)

## Edge Cases
- Wrong password: Show error "Invalid credentials", do not reveal which field is wrong
- Unregistered email: Show generic error, do not confirm existence of account
- Session expiry: Redirect to login page with informational message
- Admin vs athlete redirect: Admin goes to /admin, athlete goes to /dashboard
- Refresh preserves session: Reloading the page keeps the user logged in

## Acceptance Criteria
- [ ] Signup with email and password creates a new account
- [ ] Login with valid credentials redirects to the correct dashboard
- [ ] Athlete profile is auto-created on first login (via trigger or onboarding)
- [ ] Admin role is restricted and not self-assignable
- [ ] Unauthenticated users are redirected to the login page
- [ ] Session persists across page refreshes and browser restarts (within token TTL)

## Test Notes
Admin seed credentials: asdveronabeachvolley@gmail.com / 2626. Auth provider: Supabase Auth (email/password). Role differentiation handled via profiles.role column. RLS policies must distinguish athlete vs admin.
