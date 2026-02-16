# AGENTS.md — AI Coding Agent Guide

> **Project:** ASD Verona Beach Volley — Management & E-Commerce Platform  
> **Language:** Italian (comments, docs, UI text)  
> **Template:** Claude Code Production Workflow (v2.0)

---

## 1. Project Overview

Web application for **ASD Verona Beach Volley** (sports association in Verona, Italy) that digitizes athlete management: training groups, attendance tracking, recovery sessions, payments, medical certificates, court bookings, and e-commerce for merchandise.

### Business Context
- **~136 athletes** across **17 training groups**
- **Training schedule:** Mon-Fri, 18:30-20:00 and 20:00-21:30
- **Coaches:** Matteo Bosso, Elena Colombi, and others
- **Admin email:** `asdveronabeachvolley@gmail.com`
- **Location:** Via B. Longhena, 22 — 37138 Verona

### Key Business Rules
- Groups are organized by: macro-category (male/female) × level (base/medium/pro)
- Recovery sessions: athletes can recover missed training ONLY in groups of the same level
- Payments: season fee (480-860 EUR) + association fee (15 EUR), tracked with traffic-light semaphore
- Medical certificates: agonistico / non agonistico, with 30-day expiry warning
- Court bookings: Saturday only, blocked for athletes with overdue payments
- E-commerce: VRB merchandise (t-shirts, sweatshirts), no online payment in v1

---

## 2. Tech Stack & Architecture

### Core Stack
| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 20 + TypeScript (strict mode) |
| **Framework** | React 18 + Vite (SPA, mobile-first) |
| **Styling** | Tailwind CSS + custom VRB theme |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Backend** | Supabase (PostgreSQL + Auth + RLS + Storage + Edge Functions) |
| **State** | TanStack Query (server state) + Zustand (client state) |
| **Routing** | React Router v6 |
| **Testing** | Vitest + Testing Library |
| **Deployment** | Vercel (frontend) + Supabase Cloud (backend) |

### Brand Identity (VRB Theme)
- **Primary gradient:** Orange (#F97316) → Magenta (#EC4899) → Purple (#7C3AED)
- **Logo:** Arena di Verona + beach volleyball player silhouette
- **Colors:** Black (#1A1A1A), White (#FFFFFF), Gray scale
- **Semaphore:** Green (#22C55E), Yellow (#EAB308), Red (#EF4444)
- **Reference assets:** `VRB/VRB BRAND IDENTITY MANUAL.pdf`, `VRB/logo senza sfondo.png`

---

## 3. Project Structure

```
├── .claude/                     # Claude Code configuration (auto-loaded)
│   ├── settings.json            # Hooks config + MCP Tool Search
│   └── hooks/
│       └── protect-tests.sh     # Blocks test file modification
├── docs/                        # Project documentation
│   ├── PRD.md                   # Product Requirements Document
│   ├── architecture.md          # System architecture, data models, APIs
│   ├── decision.md              # Architectural decisions (D001-D008)
│   └── features.json            # Feature tracker with acceptance criteria
├── user-stories/                # Detailed user stories per feature
│   ├── TEMPLATE.md              # Story template
│   ├── US-F001-authentication.md
│   └── ... (17 feature files)
├── hooks/                       # Git hooks & hook examples
│   ├── claude-protect-env.sh    # Blocks .env edits
│   ├── pre-commit-lint.sh       # Pre-commit linting
│   └── pre-push-tests.sh        # Pre-push test run
├── scripts/                     # Utility scripts
│   ├── worktree-setup.sh        # Git worktree for parallel features
│   ├── worktree-cleanup.sh      # Cleanup worktrees
│   ├── verify-setup.sh          # Verify environment setup
│   └── ws-load-test.sh          # WebSocket load test
├── templates/                   # AI prompt templates
│   ├── context-generation-prompt.md
│   ├── user-story-template.md
│   ├── reverse-prompt.md        # Pre-deployment audit
│   ├── adversarial-agents-prompt.md
│   ├── worktree-parallel-prompt.md
│   └── insights-workflow.md
├── VRB/                         # Brand assets & source data
│   ├── VRB BRAND IDENTITY MANUAL.pdf
│   ├── logo senza sfondo.png
│   └── gruppi_beach_volley_completo_con_formule.xlsx  # Source data
└── src/                         # Application source (to be created)
    ├── lib/                     # Utilities, Supabase client, auth
    ├── hooks/                   # React hooks (useAuth, useProfile, etc.)
    ├── components/              # React components
    │   ├── ui/                  # shadcn/ui components
    │   ├── layout/              # Header, BottomNav, Sidebar, ProtectedRoute
    │   ├── athlete/             # ProfileCard, CertificateUpload, etc.
    │   ├── admin/               # GroupManager, AttendanceSheet, etc.
    │   ├── booking/             # CourtCalendar, BookingForm
    │   └── shop/                # ProductGrid, Cart, PromotionBanner
    ├── pages/                   # Page components
    │   ├── athlete/             # DashboardPage, ProfilePage, etc.
    │   ├── admin/               # AdminDashboard, GroupsPage, etc.
    │   ├── booking/             # BookingPage
    │   └── shop/                # ShopPage, ProductDetailPage, CartPage
    ├── types/                   # TypeScript types
    └── styles/                  # Global CSS, Tailwind config
```

---

## 4. Build & Development Commands

### Environment Setup (One-time)
```bash
chmod +x env-setup.sh && ./env-setup.sh
```

### Project Initialization (Phase 0)
```bash
# Create Vite project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install @supabase/supabase-js @tanstack/react-query zustand react-router-dom
npm install tailwindcss @tailwindcss/vite class-variance-authority clsx tailwind-merge
npm install lucide-react @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-avatar @radix-ui/react-separator @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-popover
npm install date-fns zod react-hook-form @hookform/resolvers
npm install -D @types/react @types/react-dom vitest @testing-library/react @testing-library/jest-dom jsdom

# Initialize shadcn/ui
npx shadcn@latest init

# Build verification
npm run build
npm run dev
```

### Testing Commands
```bash
npm run test              # Run unit tests (Vitest)
npm run test:ui           # Run tests with UI
npm run coverage          # Generate coverage report
```

### Key shadcn/ui Components to Install
```bash
npx shadcn add button card input label badge dialog dropdown-menu select tabs toast avatar separator switch table popover calendar sheet
```

---

## 5. Development Conventions

### TypeScript Strict Mode
- **MUST** have `"strict": true` in `tsconfig.json`
- All strict flags from `tsconfig.strict.json` must be applied
- Never suppress type errors with `any` unless explicitly approved
- Rely on compiler errors, not runtime failures

### Code Style Guidelines
- **Language:** Italian for UI text, comments, and documentation
- **Naming:** PascalCase for components, camelCase for functions/variables
- **Imports:** Group by external → internal → relative (parent → sibling)
- **File structure:** Follow the file-by-file order in IMPLEMENTATION_PLAN.md Section 19
- **Hooks:** Custom hooks in `src/hooks/use{Feature}.ts`
- **Components:** Co-locate related components (e.g., `GroupManager` with `GroupsPage`)

### Git Workflow
- **Main rule:** All work must be tracked in version control
- **Parallel work:** Use **git worktrees** (not branches) for parallel features
  ```bash
  ./scripts/worktree-setup.sh feature-name
  ./scripts/worktree-cleanup.sh feature-name
  ```
- Each parallel agent gets its own worktree to avoid file conflicts
- Merge worktree outputs only after all features pass their criteria

---

## 6. Testing Strategy

### Test Integrity Rules (HOOK-ENFORCED)
- **NEVER modify files in:** `tests/`, `__tests__/`, `*.test.*`, `*.spec.*`
- **If tests fail:** Fix the implementation — not the tests
- A hook enforces this with **exit code 2** (blocking error)

### Testing Levels
| Level | Tool | Coverage |
|-------|------|----------|
| **Unit** | Vitest | Hooks, semaphore logic, cart store calculations |
| **Integration** | Vitest + TL | Auth flow, payment flow, order flow |
| **E2E/Smoke** | Agent Browser | Full user journeys |

### E2E Smoke Test Checklist
1. Login as admin (`asdveronabeachvolley@gmail.com` / `2626`)
2. Create a group
3. Add an athlete
4. Record attendance (present/absent with recovery)
5. Athlete books recovery
6. Admin records payment
7. Check semaphore updates
8. Upload medical certificate
9. Book a court
10. Place an order

---

## 7. Security & RLS

### Row Level Security (RLS)
All tables have RLS enabled. Key policies:
- `profiles`: Users see/edit only own profile; admins see all
- `groups`: Authenticated users can view; only admins can modify
- `attendances`, `payments`: Users see own; admins see all
- `court_bookings`, `orders`: **Blocked for moroso athletes** (both UI and RLS)
- `admin_logs`: Admin only

### Environment Protection
- **Never commit `.env` files** — hook blocks edits to `.env`, `credentials`, `secrets`, `*.pem`, `*.key`
- Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 8. Hooks Configuration

Hooks are configured in `.claude/settings.json`:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `protect-tests.sh` | PreToolUse Edit/Write | Blocks modifications to test files (exit 2) |
| `claude-protect-env.sh` | PreToolUse Edit/Write | Blocks edits to `.env`/secret files (exit 2) |

### Exit Code Reference
- `0` = success (proceed)
- `2` = blocking error (stop and correct)
- Any other = non-blocking warning

---

## 9. MCP Tool Search

**MCP Tool Search** is enabled via `ENABLE_TOOL_SEARCH=true` in `.claude/settings.json`.
- Prevents MCP tool schemas from loading upfront
- Tools are discovered and called on-demand
- Reduces context bloat from connected MCPs

**Installed MCPs:**
- **Context7** — Live library documentation (`@upstash/context7-mcp`)
- **Puppeteer** — Isolated browser testing (`@modelcontextprotocol/server-puppeteer`)

**Additional Tools:**
- **Agent Browser** — Context-efficient browser testing (~200-400 tokens vs full DOM)
  ```bash
  npm install -g agent-browser && agent-browser install
  ```

---

## 10. Implementation Phases

The project follows a 10-phase implementation plan in `IMPLEMENTATION_PLAN.md`:

| Phase | Features | Description |
|-------|----------|-------------|
| 0 | — | Project scaffolding, Supabase setup |
| 1 | F001, F002, F016 | Auth & profiles, mobile UI |
| 2 | F004, F005 | Groups & training calendar |
| 3 | F006, F007 | Attendance & recovery system |
| 4 | F008, F009 | Payments & morosity block |
| 5 | F010, F015 | Admin dashboard & logs |
| 6 | F003 | Medical certificates |
| 7 | F011 | Court booking (Saturday) |
| 8 | F012, F013, F014 | E-commerce & promotions |
| 9 | F017 | Data migration from Excel |
| 10 | — | Polish & deploy |

### Critical Path
Phase 0 → 1 → 2 → 3 → 4 → 5 → 10

**Parallel-safe after Phase 1:** Phases 6, 7, 8 can run in parallel once Phases 4-5 are done.

---

## 11. Data Models (Key Tables)

- `profiles` — Athletes and admins
- `groups` — Training groups (17 total)
- `group_athletes` — Many-to-many junction
- `medical_certificates` — Uploads with expiry tracking
- `training_sessions` — Scheduled sessions
- `attendances` — Presence/absence records
- `payments` — Fee tracking with semaphore
- `payment_transactions` — Individual payment records
- `court_bookings` — Saturday court reservations
- `products` — E-commerce catalog
- `orders`, `order_items` — Purchase records
- `promotions` — Partner discounts
- `admin_logs` — Audit trail

Full schema SQL is in `IMPLEMENTATION_PLAN.md` Section 15.

---

## 12. Verification Protocol

Before marking any feature complete, verify using (in priority order):

1. **Agent Browser CLI** — Preferred, accessibility tree, ~200-400 tokens
2. **Puppeteer MCP** — Isolated browser, no session interference
3. **Claude Chrome Extension** — Fallback only, heavy on context
4. **Terminal** — curl, test scripts, etc.

---

## 13. Documentation Workflow

### Before Implementation
1. Ensure docs exist: `PRD.md`, `architecture.md`, `decision.md`, `features.json`
2. Generate user stories in `user-stories/` from template
3. Use `templates/context-generation-prompt.md` if docs are missing

### After Implementation
1. Run reverse-prompting audit (`templates/reverse-prompt.md`)
2. Update `features.json` to mark feature as `passes: true`
3. Document insights in CLAUDE.md rules (`templates/insights-workflow.md`)

---

## 14. External References

| Document | Purpose |
|----------|---------|
| `IMPLEMENTATION_PLAN.md` | Complete implementation guide, SQL schema, file order |
| `docs/PRD.md` | Full product requirements |
| `docs/architecture.md` | System design, data models, API contracts |
| `docs/decision.md` | Architectural decisions D001-D008 |
| `docs/features.json` | Feature tracker with acceptance criteria |
| `user-stories/*.md` | Detailed scenarios per feature |

---

## 15. Quick Commands Reference

```bash
# Verify setup
./scripts/verify-setup.sh

# Setup git worktree for parallel feature
./scripts/worktree-setup.sh feature-name

# Cleanup worktree
./scripts/worktree-cleanup.sh feature-name

# Install shadcn component
npx shadcn add button card input label

# Run tests
npm run test

# Build for production
npm run build

# Start dev server
npm run dev
```

---

> **Last Updated:** 2026-02-13  
> **Next Review:** At major milestone completion
