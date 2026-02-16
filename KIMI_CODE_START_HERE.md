# Kimi Code — Start Here

> **This is your entry point.** Read this file first, then follow the instructions below to implement the ASD Verona Beach Volley platform.

---

## Quick Start

### Step 1: Read the project documentation (in this order)

1. **`CLAUDE.md`** — Project rules, coding standards, and constraints you MUST follow
2. **`docs/PRD.md`** — What to build (requirements, goals, success metrics)
3. **`docs/architecture.md`** — How to build it (data models, file structure, tech stack)
4. **`docs/decision.md`** — Why decisions were made (don't second-guess these)
5. **`docs/features.json`** — Feature tracker (17 features with acceptance criteria)
6. **`IMPLEMENTATION_PLAN.md`** — Step-by-step build plan with complete SQL, theme config, and file order

### Step 2: Read user stories before implementing each feature

All user stories are in `user-stories/`. Each file covers one feature:
- `US-F001-authentication.md` through `US-F017-data-migration.md`
- Read the story BEFORE implementing that feature
- Follow the optimal path first, then handle all edge cases
- Check every acceptance criterion before moving on

### Step 3: Follow the implementation phases

The `IMPLEMENTATION_PLAN.md` defines 11 phases (0-10). Follow them in order:

```
Phase 0: Scaffolding (Vite + React + TS + Tailwind + shadcn/ui + Supabase)
Phase 1: Auth & Profiles (F001, F002, F016)
Phase 2: Groups & Calendar (F004, F005)
Phase 3: Attendance & Recovery (F006, F007)
Phase 4: Payments (F008, F009)
Phase 5: Admin Dashboard (F010, F015)
Phase 6: Certificates (F003)
Phase 7: Court Booking (F011)
Phase 8: E-Commerce (F012, F013, F014)
Phase 9: Data Migration (F017)
Phase 10: Polish & Deploy
```

### Step 4: Use the SQL schemas provided

The `IMPLEMENTATION_PLAN.md` contains **complete, ready-to-run SQL** for:
- All 14 database tables with constraints and indexes
- All RLS policies for row-level security
- Helper functions (auto-update timestamps, payment status, morosity sync)
- Copy-paste into Supabase SQL editor and run

### Step 5: Use the theme configuration provided

The `IMPLEMENTATION_PLAN.md` contains **complete Tailwind config** with:
- VRB brand colors (orange→magenta→purple gradient)
- Semaphore colors (green/yellow/red)
- CSS variables for shadcn/ui integration
- Font families (Inter, Montserrat)

---

## Project File Map

```
asd-verona-beach-volley/
├── KIMI_CODE_START_HERE.md      ← YOU ARE HERE
├── CLAUDE.md                     ← Coding rules & project context
├── IMPLEMENTATION_PLAN.md        ← Complete build plan with SQL & config
├── docs/
│   ├── PRD.md                    ← Product requirements
│   ├── architecture.md           ← Architecture & data models
│   ├── decision.md               ← Decision log (8 decisions)
│   └── features.json             ← Feature tracker (17 features)
├── user-stories/
│   ├── US-F001-authentication.md
│   ├── US-F002-athlete-profile.md
│   ├── US-F003-medical-certificates.md
│   ├── US-F004-group-management.md
│   ├── US-F005-training-calendar.md
│   ├── US-F006-attendance-tracking.md
│   ├── US-F007-recovery-system.md
│   ├── US-F008-payment-management.md
│   ├── US-F009-payment-reminders.md
│   ├── US-F010-admin-dashboard.md
│   ├── US-F011-court-booking.md
│   ├── US-F012-product-catalog.md
│   ├── US-F013-shopping-cart.md
│   ├── US-F014-promotions.md
│   ├── US-F015-admin-logs.md
│   ├── US-F016-mobile-ui.md
│   └── US-F017-data-migration.md
├── VRB/                          ← Brand assets
│   ├── logo senza sfondo.png     ← Main logo (copy to public/logo.png)
│   ├── VRB BRAND IDENTITY MANUAL.pdf
│   ├── gruppi_beach_volley_completo_con_formule.xlsx  ← Source data
│   └── WhatsApp Image *.jpeg     ← Merchandise mockups
├── templates/                    ← Workflow templates (reference only)
├── scripts/                      ← Utility scripts
├── hooks/                        ← Git/Claude hooks
├── .claude/                      ← Claude Code config
├── tsconfig.strict.json          ← TypeScript strict config (copy to tsconfig.json)
└── env-setup.sh                  ← Environment setup script
```

---

## Critical Rules

1. **TypeScript strict mode** — `strict: true` in tsconfig.json. Never use `any`.
2. **Never modify test files** — Fix the implementation, not the tests.
3. **Mobile-first** — Design for 375px width first, then scale up.
4. **RLS everywhere** — Every table has Row Level Security. Athletes see only their own data.
5. **Semaphore system** — Traffic lights (green/yellow/red) for certificates and payments. Match the Excel formulas exactly.
6. **Morosity block** — Athletes with `status = 'overdue'` (zero payment) cannot book courts or place orders. Both UI and RLS enforce this.
7. **Brand consistency** — VRB gradient (orange #F97316 → magenta #EC4899 → purple #7C3AED). Black and white. Logo in header.

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (strict) |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + RLS + Storage + Edge Functions + Realtime) |
| Server State | TanStack Query |
| Client State | Zustand (cart only) |
| Routing | React Router v6 |
| Testing | Vitest + Testing Library |
| Deploy | Vercel (frontend) + Supabase Cloud (backend) |
| Forms | React Hook Form + Zod validation |

---

## Feature Dependency Graph

```
F016 (UI/Theme) ─────────────────────────────────────────┐
F001 (Auth) ──┬── F002 (Profile) ──── F003 (Certificates) │
              ├── F004 (Groups) ──── F005 (Calendar)       │
              │         └──────────── F006 (Attendance)    │
              │                            └── F007 (Recovery)
              ├── F008 (Payments) ── F009 (Morosity)       │
              │         └──────────── F010 (Admin) ── F015 (Logs)
              │                       F011 (Booking) ◄─── F009
              ├── F012 (Products) ── F013 (Cart/Orders) ◄─ F009
              └── F014 (Promotions)                        │
F017 (Migration) ◄── F001 + F004 + F008                   │
                                                           │
All features ──────────────────────────────────────────────┘
```

---

## When You're Done

After implementing all features:
1. Run through the smoke test in `IMPLEMENTATION_PLAN.md` → Testing Strategy
2. Update `docs/features.json` — set `"passes": true` for each completed feature
3. Deploy to Vercel + Supabase Cloud
4. Run the data migration script to import Excel data

---

## Business Context (for UI copy and labels)

- **Organization:** ASD Verona Beach Volley (VRB)
- **Address:** Via B. Longhena, 22 — 37138 Verona
- **P.IVA:** IT05167170231
- **Language:** Italian (all UI labels, buttons, messages in Italian)
- **Admin email:** asdveronabeachvolley@gmail.com
- **Admin password:** 2626
- **Season:** 2025-2026
- **Training days:** Lunedì-Venerdì
- **Time slots:** 18:30-20:00, 20:00-21:30
- **Court booking:** Solo Sabato
- **Certificate types:** Agonistico, Non Agonistico
- **Payment methods:** Bonifico, PayPal, Contanti
- **T-shirt sizes:** XS, S, M, L, XL, XXL

### Italian UI Labels Reference

```
Login / Accedi
Sign Up / Registrati
Dashboard / Bacheca
Profile / Profilo
Calendar / Calendario
Attendance / Presenze
Recovery / Recuperi
Payments / Pagamenti
Booking / Prenotazione Campi
Shop / Negozio
Cart / Carrello
Orders / Ordini
Groups / Gruppi
Athletes / Atleti
Certificates / Certificati Medici
Promotions / Promozioni
Settings / Impostazioni
Logout / Esci
Present / Presente
Absent / Assente
Paid / Pagato
Partial / Parziale
Overdue / In Ritardo
Valid / Valido
Expiring / In Scadenza
Expired / Scaduto
Save / Salva
Cancel / Annulla
Confirm / Conferma
Delete / Elimina
Search / Cerca
Filter / Filtra
Upload / Carica
Download / Scarica
```
