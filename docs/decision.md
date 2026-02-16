# Decision Log

## D001: Backend Platform Selection

**Context:** Serve un backend con auth, database, storage file e real-time capabilities per un'app gestionale sportiva con ~136 atleti.

**Options Considered:**
1. **Supabase** — BaaS con PostgreSQL, Auth, Storage, Edge Functions, Realtime, RLS built-in
2. **Firebase** — BaaS Google con Firestore (NoSQL), Auth, Storage, Cloud Functions
3. **Custom Express + PostgreSQL** — Full control, self-hosted

**Decision:** Supabase

**Rationale:** PostgreSQL con RLS nativo permette di isolare i dati atleta a livello di database senza middleware custom. L'auth email/password e lo storage sono inclusi. Il modello relazionale si adatta perfettamente alla struttura dati (gruppi, atleti, presenze, pagamenti). Edge Functions per cron jobs (promemoria pagamenti, scadenze certificati).

**Trade-offs:** Vendor lock-in su Supabase. Free tier limitato (500MB DB, 1GB storage) — potrebbe servire upgrade a Pro ($25/mese) con crescita. Meno flessibilità rispetto a backend custom per logica business complessa.

---

## D002: Frontend Framework — React SPA vs Next.js

**Context:** L'app è privata (richiede login), mobile-first, non necessita di SEO.

**Options Considered:**
1. **React + Vite (SPA)** — Client-side rendering, routing con React Router
2. **Next.js (App Router)** — SSR/SSG, API routes, server components
3. **Remix** — Full-stack, nested routes, progressive enhancement

**Decision:** React + Vite (SPA)

**Rationale:** App privata dietro auth = nessun bisogno di SSR/SEO. SPA con Vite offre DX superiore (HMR istantaneo, build veloce), meno complessità architetturale, deployment statico su Vercel. Supabase client-side SDK gestisce tutto il data fetching con RLS.

**Trade-offs:** Nessun SSR = primo caricamento leggermente più lento (mitigato con code splitting). No API routes server-side (compensato da Supabase Edge Functions).

---

## D003: Build Tool — Vite vs Create React App

**Context:** Scelta del build tool per il progetto React.

**Options Considered:**
1. **Vite** — Build tool moderno, ESM-native, HMR ultra veloce
2. **Create React App** — Setup classico React, webpack-based

**Decision:** Vite

**Rationale:** CRA è deprecato/in manutenzione. Vite è lo standard de facto per React 2025+. HMR 10-50x più veloce, build ottimizzate, tree-shaking superiore, supporto TypeScript nativo.

**Trade-offs:** Nessuno significativo. Vite è strettamente superiore a CRA.

---

## D004: UI Component Library

**Context:** Serve una libreria di componenti accessibili, responsive, personalizzabile con la palette VRB.

**Options Considered:**
1. **shadcn/ui** — Componenti copia-incolla, Tailwind-native, Radix UI primitives
2. **Material UI (MUI)** — Google design system, completa, pesante
3. **Ant Design** — Enterprise-oriented, meno mobile-friendly
4. **Chakra UI** — Accessible, ma migrazione a Tailwind complessa

**Decision:** shadcn/ui

**Rationale:** Tailwind-native = personalizzazione totale con la palette VRB (gradiente arancione-magenta-viola). Componenti copiati nel progetto = nessuna dipendenza esterna, pieno controllo. Basato su Radix UI = accessibility built-in (ARIA, keyboard navigation). Leggero, tree-shakeable, perfetto per mobile.

**Trade-offs:** Meno componenti pre-built rispetto a MUI. Richiede più lavoro per componenti complessi (data tables, date pickers). Mitigato da plugin shadcn/ui community.

---

## D005: Payment Processing Strategy

**Context:** Gli atleti pagano quote stagionali (480-860 EUR) e associative (15 EUR). Attualmente tracking via Excel.

**Options Considered:**
1. **Tracking manuale** — Admin registra pagamenti ricevuti (bonifico, PayPal, contanti), app calcola saldo e mostra semaforo
2. **Stripe integration** — Pagamento online, riconciliazione automatica
3. **PayPal Business** — Pagamento online con PayPal

**Decision:** Tracking manuale (v1)

**Rationale:** La maggior parte dei pagamenti avviene via bonifico bancario o contanti. Integrare un payment gateway per v1 aggiunge complessità significativa (PCI compliance, gestione rimborsi, commissioni). Il sistema a semaforo (verde/giallo/rosso) digitalizza il processo Excel attuale. Stripe/PayPal può essere aggiunto in v2.

**Trade-offs:** Nessuna riconciliazione automatica. Admin deve registrare manualmente ogni pagamento. Possibilità di errori umani. Nessun promemoria di pagamento automatizzato lato banca.

---

## D006: State Management

**Context:** L'app è data-heavy (atleti, gruppi, presenze, pagamenti) con dati provenienti da Supabase.

**Options Considered:**
1. **TanStack Query + Zustand** — Server state (Query) + client state (Zustand)
2. **Redux Toolkit + RTK Query** — All-in-one state management
3. **Supabase Realtime only** — Reactive subscriptions senza layer di caching

**Decision:** TanStack Query + Zustand

**Rationale:** TanStack Query gestisce perfettamente il caching, la revalidazione, lo stale-while-revalidate e il refetching automatico per i dati Supabase. Zustand per lo stato UI locale (cart, filtri, form state) è minimalista e senza boilerplate. Combinazione ideale per app CRUD data-heavy.

**Trade-offs:** Due librerie di state anziché una. Ma la separazione server-state vs client-state è una best practice consolidata.

---

## D007: Medical Certificate Semaphore Logic

**Context:** Il sistema Excel usa un semaforo a 3 colori per lo stato dei certificati medici. Serve replicare la stessa logica.

**Options Considered:**
1. **Computed column in DB** — PostgreSQL generated column
2. **Edge Function cron** — Aggiornamento giornaliero dello status
3. **Client-side calculation** — Calcolo al volo nel frontend

**Decision:** Combinazione: Edge Function cron (daily) + client-side fallback

**Rationale:** Il cron aggiorna lo status di tutti i certificati ogni notte (expired se scaduto, expiring se entro 30 giorni, valid altrimenti). Il client calcola anche localmente per UI istantanea. Formula esatta dall'Excel:
- Rosso: nessun certificato, oppure scaduto (expiry < today)
- Giallo: in scadenza (expiry <= today + 30 giorni)
- Verde: valido (expiry > today + 30 giorni)

**Trade-offs:** Leggera ridondanza tra cron e client. Ma garantisce che anche utenti che non fanno login vedano status aggiornato (per notifiche email).

---

## D008: Recovery System — Cross-Group Booking

**Context:** Gli atleti assenti possono recuperare la lezione in un altro gruppo dello stesso livello. Attualmente gestito via Excel (Disponibilita_Recuperi sheet).

**Options Considered:**
1. **Self-service booking** — Atleta sceglie tra slot disponibili filtrati per livello
2. **Admin-only assignment** — Solo admin assegna i recuperi
3. **Ibrido** — Atleta richiede, admin approva

**Decision:** Self-service con vincoli automatici

**Rationale:** Riduce il carico admin. L'atleta vede solo i gruppi compatibili (stesso livello). Il sistema verifica automaticamente: (a) posti disponibili nel gruppo target, (b) livello compatibile, (c) l'atleta ha assenze da recuperare. Nessuna approvazione admin necessaria.

**Trade-offs:** Rischio di gruppi sovraffollati in certi slot. Mitigato da limite max_athletes per gruppo e visualizzazione posti disponibili.
