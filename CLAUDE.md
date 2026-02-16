# Project Instructions for Claude Code

This file is loaded automatically at the start of every Claude Code session.
It encodes the team's best practices extracted from production usage.

> **Project:** ASD Verona Beach Volley — Management & E-Commerce Platform
> **Prerequisite:** Run `env-setup.sh` once per machine to install all tools and MCPs referenced below.

---

## 1. Context-First Workflow

Before writing any code, ensure these documents exist in `docs/`:
- `PRD.md` — project requirements and scope
- `architecture.md` — data models, file structure, APIs, architecture details
- `decision.md` — decisions made during project creation (reference for future sessions)
- `features.json` — all features in token-efficient JSON with completion criteria and pass/fail tracking

If any of these are missing, generate them before proceeding with implementation.
Use the template prompts in `templates/context-generation-prompt.md` to create them.

---

## 2. Implementation Rules

### Strict Mode
- TypeScript projects MUST have `strict: true` in `tsconfig.json`
- Rely on compiler errors, not runtime failures
- Never suppress type errors with `any` unless explicitly approved by the user

### Test Integrity
- NEVER modify files in `tests/`, `__tests__/`, `*.test.*`, or `*.spec.*` directories
- If tests fail, fix the implementation — not the tests
- A hook enforces this rule (see `.claude/hooks/` config)

### Git Discipline
- All work must be tracked in version control
- For multi-feature work, use **git worktrees** — not branches in the same working directory
- Each parallel agent gets its own worktree to avoid file conflicts
- Merge worktree outputs only after all features pass their criteria

---

## 3. Agent Behavior Rules

### Multi-Agent / Swarm Sessions
- Do NOT poll the task list indefinitely. If no progress after 3 checks, take action or report the blocker.
- When using parallel agents, assign each agent a clear isolated scope (separate files/directories/worktrees).
- Always prefer worktrees over branches for parallel agent work.

### Adversarial Verification Pattern
For research or complex implementation tasks, use two agents:
1. **Executor agent** — performs the task (research, implementation, etc.)
2. **Verifier agent** — fact-checks, reviews, or tests the executor's output
The verifier is blocked until the executor produces a first draft. They then iterate until accuracy is confirmed.

### Context Window Management
- MCP Tool Search is enabled via `ENABLE_TOOL_SEARCH=true` in `.claude/settings.json` under the `env` key
- This prevents all MCP tool schemas from loading upfront — tools are discovered and called on-demand
- Accepted values: `"true"` (always on), `"auto"` (activates when MCPs exceed 10% of context), `"auto:N"` (custom threshold)
- Prefer Agent Browser over Chrome extension for UI verification (200-400 tokens vs full DOM)

---

## 4. Verification Protocol

Before marking any feature complete, the agent must verify its work using available tools in this priority order:

1. **Agent Browser CLI** (preferred) — uses accessibility tree, context-efficient (~200-400 tokens)
2. **Puppeteer MCP** — isolated browser, no session interference
3. **Claude Chrome Extension** — fallback only, heavy on context

If none of the above are available, use terminal-based verification (curl, test scripts, etc.).

---

## 5. Reverse Prompting (Pre-Deployment)

After implementation and testing pass, run a reverse-prompting audit:
- Review the implementation and identify areas where the app could fail
- Pattern-match against common failure modes from similar applications
- Look at the code from a different angle than the one used during implementation
- Document findings and fix critical issues before marking the task as done

Use the prompt template in `templates/reverse-prompt.md`.

---

## 6. Scenario-Based Testing

- User stories live in `user-stories/` and must be written BEFORE implementation
- Each story covers: feature aspect, priority, acceptance criteria, optimal path, and edge cases
- Implementation follows stories one by one, starting with the optimal path
- All edge cases in the story must be covered before a feature is marked complete

---

## 7. Documentation via Context7 MCP

- When implementing features that depend on external libraries/frameworks, use Context7 MCP to fetch the latest documentation
- Do NOT rely solely on training data for library APIs — always verify with Context7
- This prevents errors from dependency mismatches and outdated API usage

---

## 8. Hooks Configuration

Hooks are configured in `.claude/settings.json`. Two hooks are active:
- **Test protection** (`.claude/hooks/protect-tests.sh`): Blocks modifications to test files
- **Env protection** (`hooks/claude-protect-env.sh`): Blocks modifications to `.env`, secrets, and key files

Exit code reference:
- Exit code 0 = success (proceed)
- Exit code 2 = blocking error (stop and correct)
- Any other exit code = non-blocking warning

See `.claude/settings.json` for the full hooks configuration.

---

## 9. MCP Tool Search

MCP Tool Search prevents context bloat from connected MCPs.
- Configured via `ENABLE_TOOL_SEARCH` in the `env` key of `.claude/settings.json`
- When enabled, tool schemas are NOT loaded upfront — they are discovered and called on-demand
- This is already set to `"true"` in this project's settings
- Note: The legacy env var `ENABLE_EXPERIMENTAL_MCP_CLI` is deprecated — use `ENABLE_TOOL_SEARCH` instead

---

## 10. Project-Specific Context

### Brand Identity
- **Colors:** Gradient orange (#F97316) → magenta (#EC4899) → purple (#7C3AED), black, white
- **Logo:** Arena di Verona + beach volleyball player silhouette
- **Merchandise:** VRB t-shirts (white/black), sweatshirts, with BVQS sponsor logo
- **Reference:** `VRB/VRB BRAND IDENTITY MANUAL.pdf`, `VRB/logo senza sfondo.png`

### Business Data
- **17 groups**, ~136 athletes, coaches (e.g., Matteo Bosso, Elena Colombi)
- **Season fees:** 480-860 EUR + 15 EUR association fee
- **Certificates:** agonistico / non agonistico / nessuno
- **Training schedule:** Mon-Fri, 18:30-20:00 and 20:00-21:30
- **Court bookings:** Saturday only
- **Source data:** `VRB/gruppi_beach_volley_completo_con_formule.xlsx`

### Tech Stack
- React 18 + Vite + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth + RLS + Storage + Edge Functions)
- TanStack Query + Zustand
- React Router v6
- Vitest + Testing Library
- Deploy: Vercel (frontend) + Supabase Cloud (backend)
