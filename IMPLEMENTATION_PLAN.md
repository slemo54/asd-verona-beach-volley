# ASD Verona Beach Volley — Master Implementation Plan

> **This document is the single source of truth for implementing the entire platform.**
> Read this file + all files in `docs/` + all files in `user-stories/` before writing any code.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Setup](#2-tech-stack--setup)
3. [Implementation Phases](#3-implementation-phases)
4. [Phase 0: Project Scaffolding](#phase-0-project-scaffolding)
5. [Phase 1: Auth & Profiles (F001, F002, F016)](#phase-1-auth--profiles)
6. [Phase 2: Groups & Calendar (F004, F005)](#phase-2-groups--calendar)
7. [Phase 3: Attendance & Recovery (F006, F007)](#phase-3-attendance--recovery)
8. [Phase 4: Payments (F008, F009)](#phase-4-payments)
9. [Phase 5: Admin Dashboard (F010, F015)](#phase-5-admin-dashboard)
10. [Phase 6: Certificates (F003)](#phase-6-certificates)
11. [Phase 7: Booking (F011)](#phase-7-booking)
12. [Phase 8: E-Commerce (F012, F013, F014)](#phase-8-e-commerce)
13. [Phase 9: Data Migration (F017)](#phase-9-data-migration)
14. [Phase 10: Polish & Deploy](#phase-10-polish--deploy)
15. [Database Schema (Complete SQL)](#database-schema-complete-sql)
16. [RLS Policies (Complete SQL)](#rls-policies-complete-sql)
17. [Edge Functions](#edge-functions)
18. [Brand & Theme Configuration](#brand--theme-configuration)
19. [File-by-File Implementation Order](#file-by-file-implementation-order)
20. [Testing Strategy](#testing-strategy)
21. [Deployment Checklist](#deployment-checklist)

---

## 1. Project Overview

**What:** Web app for ASD Verona Beach Volley (Verona, Italy) — manages training groups, attendance, recovery sessions, payments, medical certificates, court bookings, and merchandising.

**Who:**
- ~136 athletes across 17 training groups
- Admin staff (asdveronabeachvolley@gmail.com)
- Coaches (e.g., Matteo Bosso, Elena Colombi)

**Key Business Rules:**
- Training: Mon-Fri, 18:30-20:00 and 20:00-21:30
- Groups: Male/Female × Base/Medium/Pro levels
- Recovery: Athletes can recover missed sessions ONLY in groups of the same level
- Payments: Season fee (480-860 EUR) + association fee (15 EUR), traffic-light system
- Certificates: agonistico/non agonistico, 30-day expiry warning
- Court booking: Saturday only, blocked for athletes with overdue payments
- E-commerce: VRB merchandise (t-shirts, sweatshirts), no online payment in v1

**Reference documents:**
- `docs/PRD.md` — Full requirements
- `docs/architecture.md` — Data models, file structure, APIs
- `docs/decision.md` — Architectural decisions and rationale
- `docs/features.json` — Feature tracker with acceptance criteria
- `user-stories/` — Detailed user stories per feature
- `VRB/` — Brand assets (logo, merchandise mockups, Excel data)

---

## 2. Tech Stack & Setup

### Dependencies to Install

```bash
# Create Vite + React + TypeScript project
npm create vite@latest . -- --template react-ts

# Core dependencies
npm install @supabase/supabase-js @tanstack/react-query zustand react-router-dom

# UI
npm install tailwindcss @tailwindcss/vite class-variance-authority clsx tailwind-merge
npm install lucide-react @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-avatar @radix-ui/react-separator @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-popover

# Utilities
npm install date-fns zod react-hook-form @hookform/resolvers

# Dev dependencies
npm install -D @types/react @types/react-dom vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Environment Variables (`.env.local`)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### TypeScript Config (`tsconfig.json`)

Must include `"strict": true` and all strict flags from `tsconfig.strict.json`.

### Tailwind Config

Use the VRB brand theme (see Section 18 below).

---

## 3. Implementation Phases

```
Phase 0: Scaffolding ──→ Phase 1: Auth & UI ──→ Phase 2: Groups ──→ Phase 3: Attendance
                                                                            │
Phase 10: Deploy ←── Phase 9: Migration ←── Phase 8: E-Commerce ←── Phase 4: Payments
                                                       │                     │
                                              Phase 7: Booking ←── Phase 5: Admin ←── Phase 6: Certs
```

**Critical path:** Phase 0 → 1 → 2 → 3 → 4 → 5 → 10
**Parallel-safe after Phase 1:** Phases 6, 7, 8 can run in parallel once Phase 4-5 are done.

---

## Phase 0: Project Scaffolding

### Steps:
1. Initialize Vite + React + TypeScript project
2. Install all dependencies (see Section 2)
3. Configure Tailwind CSS with VRB theme
4. Set up shadcn/ui (init + install components: button, card, input, label, badge, dialog, dropdown-menu, select, tabs, toast, avatar, separator, switch, table, popover, calendar, sheet)
5. Create directory structure matching `docs/architecture.md` File Structure
6. Set up Supabase project at supabase.com
7. Run complete database schema SQL (Section 15)
8. Configure RLS policies (Section 16)
9. Create Supabase Storage buckets: `certificates`, `product-images`, `avatars`
10. Set up `.env.local` with Supabase credentials
11. Create `src/lib/supabase.ts` — Supabase client singleton
12. Create `src/lib/utils.ts` — cn() helper for Tailwind class merging
13. Verify build passes with `npm run build`

### Files to create:
```
src/lib/supabase.ts
src/lib/utils.ts
src/styles/globals.css
src/types/database.ts
```

### Validation:
- `npm run build` succeeds with zero errors
- `npm run dev` shows blank React app

---

## Phase 1: Auth & Profiles (F001, F002, F016)

### Steps:
1. **Supabase Auth setup:**
   - Enable email/password auth in Supabase dashboard
   - Create Edge Function `on-signup` that auto-creates `profiles` row
   - Seed admin user: `asdveronabeachvolley@gmail.com` with password `2626`, role `admin`

2. **Auth context & hooks:**
   - `src/lib/auth.ts` — signIn, signUp, signOut, getSession helpers
   - `src/hooks/useAuth.ts` — auth state hook (user, loading, signIn, signOut)

3. **Auth pages:**
   - `src/pages/LoginPage.tsx` — Email/password form with VRB branding
   - VRB logo centered, gradient background, card-based form

4. **Layout components:**
   - `src/components/layout/Header.tsx` — VRB logo, user menu dropdown
   - `src/components/layout/BottomNav.tsx` — Mobile bottom navigation (Home, Calendar, Shop, Profile)
   - `src/components/layout/Sidebar.tsx` — Admin desktop sidebar
   - `src/components/layout/ProtectedRoute.tsx` — Redirect to login if unauthenticated
   - `src/components/layout/AppLayout.tsx` — Wrapper with Header + BottomNav/Sidebar + content area

5. **Profile:**
   - `src/hooks/useProfile.ts` — Fetch/update current user profile
   - `src/pages/athlete/ProfilePage.tsx` — View/edit profile (name, phone, tshirt_size, avatar)
   - `src/components/athlete/ProfileCard.tsx` — Profile summary card

6. **Routing:**
   - `src/App.tsx` — React Router setup with all routes, ProtectedRoute guards, role-based redirects

### Routes:
```
/login                    — LoginPage (public)
/                         — Redirect to /dashboard
/dashboard                — Athlete DashboardPage
/profile                  — ProfilePage
/calendar                 — CalendarPage (Phase 2)
/attendance               — AttendancePage (Phase 3)
/recovery                 — RecoveryPage (Phase 3)
/payments                 — PaymentsPage (Phase 4)
/booking                  — BookingPage (Phase 7)
/shop                     — ShopPage (Phase 8)
/shop/:id                 — ProductDetailPage (Phase 8)
/cart                     — CartPage (Phase 8)
/admin                    — AdminDashboard (admin only)
/admin/groups             — GroupsPage (admin)
/admin/athletes           — AthletesPage (admin)
/admin/attendance         — AttendanceMgmtPage (admin)
/admin/payments           — PaymentsMgmtPage (admin)
/admin/products           — ProductMgmtPage (admin)
/admin/orders             — OrdersMgmtPage (admin)
/admin/logs               — LogsPage (admin)
```

### Validation:
- Sign up creates profile in DB
- Login redirects to dashboard
- Unauthenticated access redirects to /login
- Admin login shows admin sidebar
- Bottom nav visible on mobile, sidebar on desktop
- Profile edit saves to DB

---

## Phase 2: Groups & Calendar (F004, F005)

### Steps:
1. **Groups hooks:**
   - `src/hooks/useGroups.ts` — CRUD groups, list groups with athletes, coaches
   - Query: groups with count of active athletes

2. **Athlete dashboard:**
   - `src/pages/athlete/DashboardPage.tsx` — Shows: my group, next training, payment status, certificate status, promotions
   - Card-based layout, each card links to detail page

3. **Training calendar:**
   - `src/pages/athlete/CalendarPage.tsx` — Weekly calendar Mon-Fri showing training sessions
   - Highlight current day, show athlete's group sessions
   - Week navigation (previous/next)
   - Each session shows: group name, time slot, coach

4. **Admin groups management:**
   - `src/pages/admin/GroupsPage.tsx` — List all groups with details
   - `src/components/admin/GroupManager.tsx` — Create/edit group form (name, coach, category, level, day, time)
   - Athlete assignment: drag or select athletes into groups
   - Move athlete between groups with confirmation dialog

### Data flow:
```
groups table → useGroups hook → GroupsPage/CalendarPage
group_athletes table → joined with profiles → athlete list per group
training_sessions table → calendar display
```

### Validation:
- Admin creates group with all fields
- Admin assigns athletes to groups
- Athlete sees own group on dashboard
- Calendar shows correct weekly schedule
- Week navigation works

---

## Phase 3: Attendance & Recovery (F006, F007)

### Steps:
1. **Attendance hooks:**
   - `src/hooks/useAttendance.ts` — Create session, record attendance, get history
   - Queries: attendance by session, attendance stats by athlete

2. **Admin attendance sheet:**
   - `src/pages/admin/AttendanceMgmtPage.tsx` — Select group → select date → see athletes
   - `src/components/admin/AttendanceSheet.tsx` — List of athletes with toggle (present/absent)
   - Mark absent with "needs recovery" checkbox
   - Save all at once
   - Mobile: swipe right = present, swipe left = absent

3. **Athlete attendance view:**
   - `src/pages/athlete/AttendancePage.tsx` — Personal history
   - `src/components/athlete/AttendanceHistory.tsx` — Table: date, status, recovery info
   - Summary card: total presences, absences, recoveries done, recoveries pending

4. **Recovery system:**
   - `src/pages/athlete/RecoveryPage.tsx` — List of pending recoveries + book new
   - `src/components/athlete/RecoveryBooking.tsx` — Shows available groups (same level only), available slots, book button
   - Logic: filter groups WHERE level = athlete's group level AND current_athletes < max_athletes
   - On booking: create attendance record with recovery_group_id

### Key logic:
```typescript
// Recovery availability check
const availableGroups = groups.filter(g =>
  g.level === myGroup.level &&
  g.id !== myGroup.id &&
  g.current_count < g.max_athletes
);
```

### Validation:
- Admin records attendance for a group session
- Absence count increases for marked-absent athletes
- Recovery booking shows only same-level groups
- Full groups are not shown / disabled
- Recovery completion updates stats

---

## Phase 4: Payments (F008, F009)

### Steps:
1. **Payment hooks:**
   - `src/hooks/usePayments.ts` — Get payment status, record transaction, get history
   - Computed: balance_due, payment status (paid/partial/overdue), semaphore color

2. **Athlete payment view:**
   - `src/pages/athlete/PaymentsPage.tsx` — Payment summary with semaphore
   - `src/components/athlete/PaymentStatus.tsx` — Card with: season fee, association fee, paid, balance, semaphore indicator
   - Transaction history table

3. **Payment semaphore logic:**
   ```typescript
   function getPaymentStatus(payment: Payment): 'green' | 'yellow' | 'red' {
     if (payment.amount_paid <= 0) return 'red';
     if (payment.balance_due > 0) return 'yellow';
     return 'green';
   }
   ```

4. **Morosity block:**
   - `src/hooks/useMorosity.ts` — Check if current user is moroso
   - Returns boolean, used to disable booking/ordering buttons
   - Warning banner component shown on dashboard if moroso
   - RLS policy: INSERT on court_bookings and orders denied if balance_due > 0

5. **Admin payment management:**
   - `src/pages/admin/PaymentsMgmtPage.tsx` — All athletes with payment overview
   - Sortable/filterable by: status, balance, group
   - Record payment dialog: amount, method (bonifico/PayPal/contanti), date, notes
   - Bulk view with red/yellow/green indicators

6. **Payment reminder Edge Function:**
   - `supabase/functions/payment-reminders/index.ts` — Cron weekly
   - Query athletes WHERE balance_due > 0
   - Send email via Supabase Auth email

### Validation:
- Admin creates payment record for athlete
- Admin records partial payment, balance updates
- Semaphore shows correct color
- Moroso athlete sees warning banner
- Moroso athlete cannot book courts or place orders

---

## Phase 5: Admin Dashboard (F010, F015)

### Steps:
1. **Admin dashboard:**
   - `src/pages/admin/AdminDashboard.tsx` — Summary cards grid:
     - Total athletes (with trend)
     - Active groups count
     - Overdue payments count (red)
     - Expiring certificates count (yellow/red)
     - Pending orders count
     - Recent activity feed

2. **Admin athlete management:**
   - `src/pages/admin/AthletesPage.tsx` — Full athlete table
   - Search, filter by group/status/payment
   - Click to open athlete detail modal
   - Bulk CSV import button
   - `src/components/admin/AthleteManager.tsx` — CRUD form

3. **Audit logs:**
   - `src/pages/admin/LogsPage.tsx` — Admin log viewer
   - `src/components/admin/AdminLogs.tsx` — Filterable log table (date, admin, action, entity, details)
   - Auto-log on: move_athlete, create_group, update_payment, create_athlete, delete_athlete

4. **Logging utility:**
   - `src/lib/adminLog.ts` — Helper function to insert admin_logs
   ```typescript
   async function logAdminAction(action: string, entityType: string, entityId: number, details: object) {
     await supabase.from('admin_logs').insert({ admin_id: currentUser.id, action, entity_type: entityType, entity_id: entityId, details });
   }
   ```

### Validation:
- Admin dashboard shows correct counts
- Admin can search/filter athletes
- All admin actions appear in logs
- Logs are filterable by date and action type

---

## Phase 6: Certificates (F003)

### Steps:
1. **Certificate hooks:**
   - `src/hooks/useCertificates.ts` — Upload, get current, get history
   - Semaphore logic matching Excel formula:
     ```typescript
     function getCertStatus(cert: Certificate | null): 'green' | 'yellow' | 'red' {
       if (!cert || cert.type === 'missing') return 'red';
       const daysUntilExpiry = differenceInDays(new Date(cert.expiry_date), new Date());
       if (daysUntilExpiry < 0) return 'red';
       if (daysUntilExpiry <= 30) return 'yellow';
       return 'green';
     }
     ```

2. **Certificate upload component:**
   - `src/components/athlete/CertificateUpload.tsx`
   - File picker: PDF, JPG, PNG only, max 5MB
   - Type selector: agonistico / non agonistico
   - Date picker for expiry date
   - Upload to Supabase Storage bucket `certificates`
   - Insert record in medical_certificates table

3. **Certificate status display:**
   - Show on athlete dashboard and profile
   - Semaphore badge (red/yellow/green circle)
   - "Upload certificate" CTA if missing/expired

4. **Admin certificate view:**
   - On admin athletes page: certificate column with semaphore
   - Filter by: expired, expiring, valid, missing

5. **Edge Function: certificate-expiry-check:**
   - `supabase/functions/certificate-expiry-check/index.ts`
   - Cron daily: update status column based on expiry_date vs today

### Validation:
- Athlete uploads PDF certificate
- File appears in Supabase Storage
- Semaphore shows correct color based on expiry
- Admin sees all certificate statuses

---

## Phase 7: Booking (F011)

### Steps:
1. **Booking hooks:**
   - `src/hooks/useBookings.ts` — List available slots, create booking, cancel booking

2. **Booking page:**
   - `src/pages/booking/BookingPage.tsx` — Saturday calendar view
   - `src/components/booking/CourtCalendar.tsx` — Shows Saturday dates with available/booked slots
   - `src/components/booking/BookingForm.tsx` — Select court, time slot, confirm
   - Disabled if athlete is moroso (with message)

3. **Logic:**
   - Only Saturdays selectable
   - UNIQUE constraint prevents double-booking
   - Cancel: athlete can cancel own future bookings
   - Admin: sees all bookings, can cancel any

### Validation:
- Athlete sees Saturday slots
- Athlete books a court
- Same slot cannot be double-booked
- Moroso athlete sees disabled state with explanation
- Athlete can cancel own booking

---

## Phase 8: E-Commerce (F012, F013, F014)

### Steps:
1. **Product hooks:**
   - `src/hooks/useProducts.ts` — List products, get by ID
   - `src/hooks/useCart.ts` — Zustand store for cart (add, remove, update qty, clear)
   - `src/hooks/useOrders.ts` — Place order, get order history

2. **Shop pages:**
   - `src/pages/shop/ShopPage.tsx` — Product grid with category filter
   - `src/pages/shop/ProductDetailPage.tsx` — Full product view with size selector, add to cart
   - `src/pages/shop/CartPage.tsx` — Cart review, quantity edit, place order

3. **Product components:**
   - `src/components/shop/ProductGrid.tsx` — Responsive grid of ProductCards
   - `src/components/shop/ProductCard.tsx` — Image, name, price, "Add to cart" button
   - `src/components/shop/Cart.tsx` — Cart items with quantity controls, total
   - `src/components/shop/PromotionBanner.tsx` — Active promotions carousel/banner

4. **Cart store (Zustand):**
   ```typescript
   interface CartStore {
     items: CartItem[];
     addItem: (product: Product, size: string, qty: number) => void;
     removeItem: (productId: number, size: string) => void;
     updateQuantity: (productId: number, size: string, qty: number) => void;
     clearCart: () => void;
     total: () => number;
   }
   ```

5. **Order flow:**
   - Athlete reviews cart → clicks "Place Order"
   - Morosity check → block if moroso
   - Create order + order_items in Supabase
   - Show confirmation with order ID
   - Clear cart

6. **Admin product/order management:**
   - `src/pages/admin/ProductMgmtPage.tsx` — CRUD products with image upload
   - `src/pages/admin/OrdersMgmtPage.tsx` — View all orders, update status

7. **Promotions:**
   - Admin creates promotions in DB
   - Active promotions shown on dashboard and shop
   - Auto-hidden when past valid_until date

8. **Seed initial products:**
   - VRB T-shirt White (sizes S-XXL, from WhatsApp mockup images)
   - VRB T-shirt Black (sizes S-XXL)
   - VRB Sweatshirt Black (sizes S-XXL)

### Validation:
- Products display in grid
- Size selection works
- Add to cart, modify quantity, remove
- Place order creates DB records
- Moroso cannot place order
- Admin manages products and order statuses

---

## Phase 9: Data Migration (F017)

### Steps:
1. **Create migration script:** `scripts/migrate-excel-data.ts`
2. **Read Excel file:** `VRB/gruppi_beach_volley_completo_con_formule.xlsx`
3. **Import flow:**
   - Parse Gruppi_Atleti sheet (A1:R137)
   - Create 17 groups in `groups` table
   - Create athlete profiles (invite via Supabase Auth or create directly)
   - Assign athletes to groups via `group_athletes`
   - Import medical certificate data (type, expiry)
   - Import payment data (season fee, paid amount, balance)
4. **Make script idempotent:** Check for existing records before insert
5. **Run validation:** Compare counts with Excel source

### Data mapping from Excel:
```
Excel Column → DB Field
A (ID Gruppo) → groups.id
B (Nome Gruppo) → groups.name
C (Allenatore) → groups.coach_id (lookup by name)
D (Atleta) → profiles.full_name
E (Contatto) → profiles.phone
F (Certificato) → medical_certificates.type
G (Scadenza) → medical_certificates.expiry_date
L (Quota totale) → payments.total_season_fee
M (Quota assoc.) → payments.association_fee
N (Quota pagata) → payments.amount_paid
R (altri pag.) → payments.notes
```

### Validation:
- 17 groups created
- ~136 athletes imported
- Certificate data matches Excel
- Payment balances match Excel formulas

---

## Phase 10: Polish & Deploy

### Steps:
1. **Loading states:** Add skeleton loaders for all data-fetching pages
2. **Error handling:** Toast notifications for all mutations (success/error)
3. **Empty states:** Friendly messages when no data (no upcoming sessions, no orders, etc.)
4. **Mobile optimization:** Test all pages at 375px width, ensure touch targets ≥ 44px
5. **Image optimization:** Lazy loading, WebP format for product images
6. **PWA setup:** Add manifest.json, service worker for offline cache
7. **SEO:** Not needed (private app), but add proper page titles
8. **Deploy frontend:** Push to Vercel, configure env vars
9. **Deploy Edge Functions:** `supabase functions deploy`
10. **Set up cron jobs:** Certificate check (daily), payment reminders (weekly)
11. **Smoke test:** Login as admin, create group, add athlete, record attendance, record payment, upload certificate, book court, place order

---

## Database Schema (Complete SQL)

> **Run this ENTIRE SQL block in the Supabase SQL editor to create all tables.**

```sql
-- ============================================
-- ASD Verona Beach Volley — Complete Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'athlete' CHECK (role IN ('athlete', 'admin')),
  tshirt_size VARCHAR(5) CHECK (tshirt_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  avatar_url TEXT,
  is_moroso BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- GROUPS
-- ============================================
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  coach_id UUID REFERENCES profiles(id),
  macro_category VARCHAR(10) NOT NULL CHECK (macro_category IN ('male', 'female')),
  level VARCHAR(10) NOT NULL CHECK (level IN ('base', 'medium', 'pro')),
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('18:30-20:00', '20:00-21:30')),
  max_athletes SMALLINT NOT NULL DEFAULT 12,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- GROUP ATHLETES (junction table)
-- ============================================
CREATE TABLE group_athletes (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(group_id, athlete_id) WHERE (is_active = TRUE)
);

CREATE INDEX idx_group_athletes_group ON group_athletes(group_id) WHERE is_active = TRUE;
CREATE INDEX idx_group_athletes_athlete ON group_athletes(athlete_id) WHERE is_active = TRUE;

-- ============================================
-- MEDICAL CERTIFICATES
-- ============================================
CREATE TABLE medical_certificates (
  id SERIAL PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('agonistico', 'non_agonistico')),
  expiry_date DATE NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expiring', 'expired'))
);

CREATE INDEX idx_certificates_athlete ON medical_certificates(athlete_id);
CREATE INDEX idx_certificates_expiry ON medical_certificates(expiry_date);

-- ============================================
-- TRAINING SESSIONS
-- ============================================
CREATE TABLE training_sessions (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('18:30-20:00', '20:00-21:30')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, session_date)
);

CREATE INDEX idx_sessions_date ON training_sessions(session_date);
CREATE INDEX idx_sessions_group ON training_sessions(group_id);

-- ============================================
-- ATTENDANCES
-- ============================================
CREATE TABLE attendances (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_present BOOLEAN NOT NULL,
  needs_recovery BOOLEAN NOT NULL DEFAULT FALSE,
  recovery_date DATE,
  recovery_group_id INTEGER REFERENCES groups(id),
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, athlete_id)
);

CREATE INDEX idx_attendances_athlete ON attendances(athlete_id);
CREATE INDEX idx_attendances_session ON attendances(session_id);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  season VARCHAR(20) NOT NULL,
  total_season_fee DECIMAL(8,2) NOT NULL,
  association_fee DECIMAL(8,2) NOT NULL DEFAULT 15.00,
  amount_paid DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  balance_due DECIMAL(8,2) GENERATED ALWAYS AS (total_season_fee + association_fee - amount_paid) STORED,
  payment_method VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'overdue' CHECK (status IN ('paid', 'partial', 'overdue')),
  last_payment_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(athlete_id, season)
);

CREATE INDEX idx_payments_athlete ON payments(athlete_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- PAYMENT TRANSACTIONS
-- ============================================
CREATE TABLE payment_transactions (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount DECIMAL(8,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by UUID REFERENCES profiles(id),
  notes TEXT
);

-- ============================================
-- COURT BOOKINGS
-- ============================================
CREATE TABLE court_bookings (
  id SERIAL PRIMARY KEY,
  court_name VARCHAR(100) NOT NULL,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  booked_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(court_name, booking_date, time_slot)
);

CREATE INDEX idx_bookings_date ON court_bookings(booking_date);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(8,2) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('tshirt', 'sweatshirt', 'accessory', 'other')),
  available_sizes JSONB DEFAULT '[]'::jsonb,
  image_urls JSONB DEFAULT '[]'::jsonb,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(8,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_athlete ON orders(athlete_id);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity SMALLINT NOT NULL DEFAULT 1,
  size VARCHAR(10),
  unit_price DECIMAL(8,2) NOT NULL
);

-- ============================================
-- PROMOTIONS
-- ============================================
CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  partner_name VARCHAR(200),
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(8,2),
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ADMIN LOGS
-- ============================================
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_date ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update payment status based on amount_paid
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount_paid >= (NEW.total_season_fee + NEW.association_fee) THEN
    NEW.status = 'paid';
  ELSIF NEW.amount_paid > 0 THEN
    NEW.status = 'partial';
  ELSE
    NEW.status = 'overdue';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_status_update BEFORE INSERT OR UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_payment_status();

-- Auto-update is_moroso on profiles when payment changes
CREATE OR REPLACE FUNCTION sync_morosity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET is_moroso = (
    EXISTS (
      SELECT 1 FROM payments
      WHERE athlete_id = NEW.athlete_id
      AND status = 'overdue'
    )
  ) WHERE id = NEW.athlete_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_sync_morosity AFTER INSERT OR UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION sync_morosity();
```

---

## RLS Policies (Complete SQL)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (is_admin() OR auth.uid() = id);

-- ============================================
-- GROUPS POLICIES
-- ============================================
CREATE POLICY "Authenticated users can view groups" ON groups FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage groups" ON groups FOR ALL USING (is_admin());

-- ============================================
-- GROUP ATHLETES POLICIES
-- ============================================
CREATE POLICY "Users can view own group membership" ON group_athletes FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Admins can manage group athletes" ON group_athletes FOR ALL USING (is_admin());

-- ============================================
-- MEDICAL CERTIFICATES POLICIES
-- ============================================
CREATE POLICY "Users can view own certificates" ON medical_certificates FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Users can upload own certificates" ON medical_certificates FOR INSERT WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "Admins can manage all certificates" ON medical_certificates FOR ALL USING (is_admin());

-- ============================================
-- TRAINING SESSIONS POLICIES
-- ============================================
CREATE POLICY "Authenticated can view sessions" ON training_sessions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage sessions" ON training_sessions FOR ALL USING (is_admin());

-- ============================================
-- ATTENDANCES POLICIES
-- ============================================
CREATE POLICY "Users can view own attendance" ON attendances FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Admins can manage attendance" ON attendances FOR ALL USING (is_admin());

-- ============================================
-- PAYMENTS POLICIES
-- ============================================
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Admins can manage payments" ON payments FOR ALL USING (is_admin());

-- ============================================
-- PAYMENT TRANSACTIONS POLICIES
-- ============================================
CREATE POLICY "Users can view own transactions" ON payment_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM payments WHERE payments.id = payment_transactions.payment_id AND payments.athlete_id = auth.uid())
);
CREATE POLICY "Admins can manage transactions" ON payment_transactions FOR ALL USING (is_admin());

-- ============================================
-- COURT BOOKINGS POLICIES
-- ============================================
CREATE POLICY "Authenticated can view bookings" ON court_bookings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Non-moroso users can create bookings" ON court_bookings FOR INSERT WITH CHECK (
  auth.uid() = booked_by AND NOT (SELECT is_moroso FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can cancel own bookings" ON court_bookings FOR UPDATE USING (booked_by = auth.uid());
CREATE POLICY "Admins can manage bookings" ON court_bookings FOR ALL USING (is_admin());

-- ============================================
-- PRODUCTS POLICIES (public read)
-- ============================================
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin());

-- ============================================
-- ORDERS POLICIES
-- ============================================
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Non-moroso users can create orders" ON orders FOR INSERT WITH CHECK (
  auth.uid() = athlete_id AND NOT (SELECT is_moroso FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (is_admin());

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.athlete_id = auth.uid())
);
CREATE POLICY "Users can insert own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.athlete_id = auth.uid())
);
CREATE POLICY "Admins can manage order items" ON order_items FOR ALL USING (is_admin());

-- ============================================
-- PROMOTIONS POLICIES
-- ============================================
CREATE POLICY "Authenticated can view active promotions" ON promotions FOR SELECT USING (
  auth.uid() IS NOT NULL AND is_active = TRUE AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
);
CREATE POLICY "Admins can manage promotions" ON promotions FOR ALL USING (is_admin());

-- ============================================
-- ADMIN LOGS POLICIES
-- ============================================
CREATE POLICY "Admins can view logs" ON admin_logs FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert logs" ON admin_logs FOR INSERT WITH CHECK (is_admin());

-- ============================================
-- STORAGE POLICIES
-- ============================================
-- Run these in the Supabase dashboard under Storage > Policies

-- Bucket: certificates
-- SELECT: athlete can read own files, admin reads all
-- INSERT: athlete can upload to own folder (path starts with their user ID)

-- Bucket: product-images
-- SELECT: public (anyone can view)
-- INSERT/UPDATE/DELETE: admin only

-- Bucket: avatars
-- SELECT: public
-- INSERT: user can upload to own folder
```

---

## Edge Functions

### on-signup (Auth hook)
```typescript
// supabase/functions/on-signup/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { record } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  await supabase.from('profiles').insert({
    id: record.id,
    email: record.email,
    full_name: record.raw_user_meta_data?.full_name || record.email.split('@')[0],
    role: 'athlete'
  })

  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
})
```

### payment-reminders (Cron — weekly)
```typescript
// supabase/functions/payment-reminders/index.ts
// Query payments WHERE balance_due > 0
// For each, send email via Supabase Auth admin API
```

### certificate-expiry-check (Cron — daily)
```typescript
// supabase/functions/certificate-expiry-check/index.ts
// UPDATE medical_certificates SET status = CASE
//   WHEN expiry_date < CURRENT_DATE THEN 'expired'
//   WHEN expiry_date <= CURRENT_DATE + 30 THEN 'expiring'
//   ELSE 'valid'
// END
```

---

## Brand & Theme Configuration

### Tailwind CSS Custom Theme (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // VRB Brand Colors
        vrb: {
          orange: '#F97316',
          magenta: '#EC4899',
          purple: '#7C3AED',
          black: '#1A1A1A',
          white: '#FFFFFF',
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          }
        },
        // Semaphore colors
        semaphore: {
          green: '#22C55E',
          yellow: '#EAB308',
          red: '#EF4444',
        },
        // shadcn/ui theme integration
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#F97316',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#EC4899',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A1A',
        },
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#F97316',
      },
      backgroundImage: {
        'vrb-gradient': 'linear-gradient(135deg, #F97316 0%, #EC4899 50%, #7C3AED 100%)',
        'vrb-gradient-horizontal': 'linear-gradient(to right, #F97316, #EC4899, #7C3AED)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
} satisfies Config
```

### CSS Variables (`src/styles/globals.css`)
```css
@import 'tailwindcss';

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 10%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 10%;
    --primary: 24 95% 53%;        /* VRB Orange */
    --primary-foreground: 0 0% 100%;
    --secondary: 263 70% 50%;     /* VRB Purple */
    --secondary-foreground: 0 0% 100%;
    --accent: 330 81% 60%;        /* VRB Magenta */
    --accent-foreground: 0 0% 100%;
    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 24 95% 53%;
    --radius: 0.75rem;
  }
}

@layer base {
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}
```

### VRB Logo Usage
- Logo file: `VRB/logo senza sfondo.png` — copy to `public/logo.png`
- Header: logo 40px height on mobile, 48px on desktop
- Login page: logo 120px centered above form
- Gradient background for login page and headers

---

## File-by-File Implementation Order

This is the **exact sequence** to create files. Each file depends only on files above it.

```
 1. src/lib/utils.ts                    ← cn() helper
 2. src/lib/supabase.ts                 ← Supabase client
 3. src/types/database.ts               ← TypeScript types for all tables
 4. src/styles/globals.css              ← Tailwind + CSS vars
 5. src/lib/auth.ts                     ← Auth helpers
 6. src/hooks/useAuth.ts                ← Auth hook
 7. src/hooks/useProfile.ts             ← Profile hook
 8. src/components/ui/*                 ← shadcn/ui components (install via CLI)
 9. src/components/layout/Header.tsx    ← App header
10. src/components/layout/BottomNav.tsx ← Mobile nav
11. src/components/layout/Sidebar.tsx   ← Admin sidebar
12. src/components/layout/ProtectedRoute.tsx
13. src/components/layout/AppLayout.tsx
14. src/pages/LoginPage.tsx
15. src/App.tsx                         ← Router + layouts
16. src/main.tsx                        ← Entry point
    --- AUTH WORKING ---
17. src/pages/athlete/ProfilePage.tsx
18. src/components/athlete/ProfileCard.tsx
19. src/hooks/useGroups.ts
20. src/pages/athlete/DashboardPage.tsx
21. src/pages/athlete/CalendarPage.tsx
22. src/pages/admin/GroupsPage.tsx
23. src/components/admin/GroupManager.tsx
    --- GROUPS & CALENDAR WORKING ---
24. src/hooks/useAttendance.ts
25. src/pages/admin/AttendanceMgmtPage.tsx
26. src/components/admin/AttendanceSheet.tsx
27. src/pages/athlete/AttendancePage.tsx
28. src/components/athlete/AttendanceHistory.tsx
29. src/pages/athlete/RecoveryPage.tsx
30. src/components/athlete/RecoveryBooking.tsx
    --- ATTENDANCE & RECOVERY WORKING ---
31. src/hooks/usePayments.ts
32. src/hooks/useMorosity.ts
33. src/pages/athlete/PaymentsPage.tsx
34. src/components/athlete/PaymentStatus.tsx
35. src/pages/admin/PaymentsMgmtPage.tsx
    --- PAYMENTS WORKING ---
36. src/lib/adminLog.ts
37. src/pages/admin/AdminDashboard.tsx
38. src/pages/admin/AthletesPage.tsx
39. src/components/admin/AthleteManager.tsx
40. src/pages/admin/LogsPage.tsx
41. src/components/admin/AdminLogs.tsx
    --- ADMIN DASHBOARD WORKING ---
42. src/hooks/useCertificates.ts
43. src/components/athlete/CertificateUpload.tsx
    --- CERTIFICATES WORKING ---
44. src/hooks/useBookings.ts
45. src/pages/booking/BookingPage.tsx
46. src/components/booking/CourtCalendar.tsx
47. src/components/booking/BookingForm.tsx
    --- BOOKING WORKING ---
48. src/hooks/useProducts.ts
49. src/hooks/useCart.ts                ← Zustand store
50. src/hooks/useOrders.ts
51. src/pages/shop/ShopPage.tsx
52. src/pages/shop/ProductDetailPage.tsx
53. src/pages/shop/CartPage.tsx
54. src/components/shop/ProductGrid.tsx
55. src/components/shop/ProductCard.tsx
56. src/components/shop/Cart.tsx
57. src/components/shop/PromotionBanner.tsx
58. src/pages/admin/ProductMgmtPage.tsx
59. src/pages/admin/OrdersMgmtPage.tsx
    --- E-COMMERCE WORKING ---
60. scripts/migrate-excel-data.ts
    --- DATA MIGRATION DONE ---
```

---

## Testing Strategy

### Unit Tests (Vitest)
- All hooks: test queries, mutations, error states
- Semaphore logic functions (certificate, payment)
- Cart store: add, remove, update, total calculation
- Recovery availability filter logic

### Integration Tests
- Auth flow: signup → profile created → login → session persists
- Payment flow: create → record transaction → status updates → morosity syncs
- Order flow: add to cart → place order → DB records created

### E2E Smoke Test (Manual or Agent Browser)
1. Login as admin
2. Create a group
3. Add an athlete
4. Record attendance (present)
5. Record attendance (absent with recovery)
6. Athlete books recovery in another group
7. Admin records a payment
8. Check semaphore updates
9. Upload medical certificate
10. Book a court
11. Add product to shop
12. Athlete places an order
13. Admin updates order status

---

## Deployment Checklist

- [ ] Supabase project created and configured
- [ ] All SQL schema executed
- [ ] All RLS policies applied
- [ ] Storage buckets created (certificates, product-images, avatars)
- [ ] Edge Functions deployed
- [ ] Cron jobs configured (daily cert check, weekly payment reminder)
- [ ] Admin user seeded (asdveronabeachvolley@gmail.com)
- [ ] Environment variables set in Vercel
- [ ] Frontend deployed to Vercel
- [ ] Smoke test passed
- [ ] Data migration from Excel executed
- [ ] All 17 features in features.json marked as `passes: true`

---

> **END OF IMPLEMENTATION PLAN**
> This document, combined with `docs/PRD.md`, `docs/architecture.md`, `docs/decision.md`, `docs/features.json`, and `user-stories/*.md`, provides everything needed to implement the complete platform.
