# Architecture Document

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Mobile-First)                 │
│              React + TypeScript + Tailwind CSS            │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────┴──────────────────────────────┐
│                     Supabase Platform                    │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Auth    │  │  PostgreSQL   │  │     Storage      │  │
│  │ (email/   │  │  + RLS        │  │  (certificati,   │  │
│  │  password) │  │  policies     │  │   immagini       │  │
│  └──────────┘  └──────────────┘  │   prodotti)       │  │
│                                   └──────────────────┘  │
│  ┌──────────────────┐  ┌────────────────────────────┐   │
│  │  Edge Functions   │  │   Realtime Subscriptions   │   │
│  │  (email notif,    │  │   (presenze live)          │   │
│  │   cron jobs)      │  │                            │   │
│  └──────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │  WhatsApp   │
                    │  Business   │
                    │  (supporto) │
                    └─────────────┘
```

---

## Tech Stack

- **Runtime:** Node.js 20 + TypeScript (strict mode)
- **Framework:** React 18 + Vite (SPA, mobile-first)
- **Styling:** Tailwind CSS + custom VRB theme (gradiente arancione-magenta/viola)
- **UI Components:** shadcn/ui (accessible, composable)
- **Backend & Auth:** Supabase (PostgreSQL, Auth, RLS, Edge Functions, Realtime)
- **Storage:** Supabase Storage (certificati medici, immagini prodotti)
- **State Management:** TanStack Query (server state) + Zustand (client state)
- **Routing:** React Router v6
- **Testing:** Vitest + Testing Library
- **Deployment:** Vercel (frontend) + Supabase Cloud (backend)

---

## Data Models

### profiles
```
id              UUID (PK, FK -> auth.users)
email           VARCHAR(255) NOT NULL UNIQUE
full_name       VARCHAR(200) NOT NULL
phone           VARCHAR(20)
role            ENUM('athlete', 'admin') DEFAULT 'athlete'
tshirt_size     ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL')
avatar_url      TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### groups
```
id              SERIAL (PK)
name            VARCHAR(100) NOT NULL        -- e.g. "Gruppo 1"
coach_id        UUID (FK -> profiles)
macro_category  ENUM('male', 'female') NOT NULL
level           ENUM('base', 'medium', 'pro') NOT NULL
day_of_week     SMALLINT NOT NULL             -- 1=Mon ... 5=Fri
time_slot       ENUM('18:30-20:00', '20:00-21:30') NOT NULL
max_athletes    SMALLINT DEFAULT 12
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### group_athletes
```
id              SERIAL (PK)
group_id        INTEGER (FK -> groups) NOT NULL
athlete_id      UUID (FK -> profiles) NOT NULL
joined_at       TIMESTAMPTZ DEFAULT NOW()
left_at         TIMESTAMPTZ
is_active       BOOLEAN DEFAULT TRUE
UNIQUE(group_id, athlete_id, is_active)
```

### medical_certificates
```
id              SERIAL (PK)
athlete_id      UUID (FK -> profiles) NOT NULL
type            ENUM('agonistico', 'non_agonistico') NOT NULL
expiry_date     DATE NOT NULL
file_url        TEXT NOT NULL
uploaded_at     TIMESTAMPTZ DEFAULT NOW()
status          ENUM('valid', 'expiring', 'expired', 'missing')
                -- computed: green/yellow/red semaphore
```

### training_sessions
```
id              SERIAL (PK)
group_id        INTEGER (FK -> groups) NOT NULL
session_date    DATE NOT NULL
time_slot       ENUM('18:30-20:00', '20:00-21:30') NOT NULL
notes           TEXT
created_by      UUID (FK -> profiles)
created_at      TIMESTAMPTZ DEFAULT NOW()
UNIQUE(group_id, session_date)
```

### attendances
```
id              SERIAL (PK)
session_id      INTEGER (FK -> training_sessions) NOT NULL
athlete_id      UUID (FK -> profiles) NOT NULL
is_present      BOOLEAN NOT NULL
needs_recovery  BOOLEAN DEFAULT FALSE
recovery_date   DATE
recovery_group_id INTEGER (FK -> groups)
notes           TEXT
recorded_at     TIMESTAMPTZ DEFAULT NOW()
UNIQUE(session_id, athlete_id)
```

### payments
```
id              SERIAL (PK)
athlete_id      UUID (FK -> profiles) NOT NULL
season          VARCHAR(20) NOT NULL          -- e.g. "2025-2026"
total_season_fee DECIMAL(8,2) NOT NULL        -- 480-860 EUR
association_fee  DECIMAL(8,2) DEFAULT 15.00
amount_paid     DECIMAL(8,2) DEFAULT 0.00
balance_due     DECIMAL(8,2) GENERATED ALWAYS AS (total_season_fee + association_fee - amount_paid)
payment_method  VARCHAR(50)                   -- "bonifico", "PayPal", "contanti"
status          ENUM('paid', 'partial', 'overdue')
                -- computed: green/yellow/red semaphore
last_payment_date TIMESTAMPTZ
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### payment_transactions
```
id              SERIAL (PK)
payment_id      INTEGER (FK -> payments) NOT NULL
amount          DECIMAL(8,2) NOT NULL
method          VARCHAR(50) NOT NULL
transaction_date TIMESTAMPTZ DEFAULT NOW()
recorded_by     UUID (FK -> profiles)
notes           TEXT
```

### court_bookings
```
id              SERIAL (PK)
court_name      VARCHAR(100) NOT NULL
booking_date    DATE NOT NULL
time_slot       VARCHAR(20) NOT NULL
booked_by       UUID (FK -> profiles) NOT NULL
status          ENUM('confirmed', 'cancelled', 'pending') DEFAULT 'pending'
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
UNIQUE(court_name, booking_date, time_slot)
```

### products
```
id              SERIAL (PK)
name            VARCHAR(200) NOT NULL
description     TEXT
price           DECIMAL(8,2) NOT NULL
category        ENUM('tshirt', 'sweatshirt', 'accessory', 'other')
available_sizes JSONB                         -- ["S","M","L","XL"]
image_urls      JSONB                         -- ["url1", "url2"]
stock           INTEGER DEFAULT 0
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### orders
```
id              SERIAL (PK)
athlete_id      UUID (FK -> profiles) NOT NULL
status          ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending'
total_amount    DECIMAL(8,2) NOT NULL
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

### order_items
```
id              SERIAL (PK)
order_id        INTEGER (FK -> orders) NOT NULL
product_id      INTEGER (FK -> products) NOT NULL
quantity        SMALLINT NOT NULL DEFAULT 1
size            VARCHAR(10)
unit_price      DECIMAL(8,2) NOT NULL
```

### promotions
```
id              SERIAL (PK)
title           VARCHAR(200) NOT NULL
description     TEXT
partner_name    VARCHAR(200)                  -- struttura convenzionata
discount_type   ENUM('percentage', 'fixed')
discount_value  DECIMAL(8,2)
valid_from      DATE
valid_until     DATE
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### admin_logs
```
id              SERIAL (PK)
admin_id        UUID (FK -> profiles) NOT NULL
action          VARCHAR(100) NOT NULL         -- "move_athlete", "create_group", etc.
entity_type     VARCHAR(50) NOT NULL
entity_id       INTEGER
details         JSONB
created_at      TIMESTAMPTZ DEFAULT NOW()
```

---

## File Structure

```
src/
├── main.tsx
├── App.tsx
├── vite-env.d.ts
├── lib/
│   ├── supabase.ts              # Supabase client init
│   ├── auth.ts                  # Auth helpers
│   └── utils.ts                 # Shared utilities
├── hooks/
│   ├── useAuth.ts               # Auth state hook
│   ├── useProfile.ts            # Current user profile
│   ├── useGroups.ts             # Groups CRUD
│   ├── useAttendance.ts         # Attendance tracking
│   ├── usePayments.ts           # Payment queries
│   ├── useProducts.ts           # E-commerce queries
│   └── useBookings.ts           # Court booking queries
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── layout/
│   │   ├── BottomNav.tsx        # Mobile bottom navigation
│   │   ├── Header.tsx           # App header with VRB logo
│   │   ├── Sidebar.tsx          # Admin sidebar (desktop)
│   │   └── ProtectedRoute.tsx   # Auth guard
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── athlete/
│   │   ├── ProfileCard.tsx
│   │   ├── CertificateUpload.tsx
│   │   ├── AttendanceHistory.tsx
│   │   ├── PaymentStatus.tsx
│   │   └── RecoveryBooking.tsx
│   ├── admin/
│   │   ├── GroupManager.tsx
│   │   ├── AthleteManager.tsx
│   │   ├── AttendanceSheet.tsx
│   │   ├── PaymentOverview.tsx
│   │   └── AdminLogs.tsx
│   ├── booking/
│   │   ├── CourtCalendar.tsx
│   │   └── BookingForm.tsx
│   └── shop/
│       ├── ProductGrid.tsx
│       ├── ProductCard.tsx
│       ├── Cart.tsx
│       └── PromotionBanner.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── athlete/
│   │   ├── DashboardPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── AttendancePage.tsx
│   │   ├── PaymentsPage.tsx
│   │   └── RecoveryPage.tsx
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── GroupsPage.tsx
│   │   ├── AthletesPage.tsx
│   │   ├── AttendanceMgmtPage.tsx
│   │   ├── PaymentsMgmtPage.tsx
│   │   └── LogsPage.tsx
│   ├── booking/
│   │   └── BookingPage.tsx
│   └── shop/
│       ├── ShopPage.tsx
│       ├── ProductDetailPage.tsx
│       └── CartPage.tsx
├── types/
│   └── database.ts              # Supabase generated types
└── styles/
    └── globals.css              # Tailwind + VRB custom theme
```

---

## API Endpoints

L'architettura usa Supabase client-side con RLS. Le Edge Functions gestiscono logica server-side.

### Supabase Edge Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| `on-signup` | Auth hook | Crea profilo in `profiles` alla registrazione |
| `payment-reminders` | Cron (weekly) | Invia email promemoria a chi ha saldo > 0 |
| `certificate-expiry-check` | Cron (daily) | Aggiorna status certificati (valid/expiring/expired) |
| `send-notification` | HTTP POST | Invia email notifica generica |

### Supabase RLS Policies

| Table | Policy | Rule |
|-------|--------|------|
| profiles | SELECT own | `auth.uid() = id` OR `role = 'admin'` |
| profiles | UPDATE own | `auth.uid() = id` |
| attendances | SELECT own | athlete can see own, admin sees all |
| payments | SELECT own | athlete can see own, admin sees all |
| groups | SELECT all | authenticated users |
| products | SELECT all | public (no auth required) |
| orders | SELECT own | `auth.uid() = athlete_id` OR admin |
| admin_logs | SELECT | admin only |
| court_bookings | INSERT | authenticated, non-moroso |
| orders | INSERT | authenticated, non-moroso |

---

## Key Design Decisions

- **Supabase over custom backend:** Zero infrastructure to manage, built-in Auth + RLS + Storage + Realtime. See D001 in decision.md.
- **React SPA over Next.js:** No SEO needed (private app), simpler deployment, faster development. See D002.
- **Vite over CRA:** Faster build times, better DX, modern defaults. See D003.
- **shadcn/ui over Material UI:** Lighter, composable, Tailwind-native, accessible. See D004.
- **Manual payments over Stripe:** v1 scope — tracking only, no online payment processing. See D005.
- **TanStack Query over Redux:** Better for server-state-heavy app, automatic caching/revalidation. See D006.
