# Product Requirements Document

## Project Overview

**Project Name:** ASD Verona Beach Volley — Management & E-Commerce Platform
**Description:** Web app completa per la gestione degli allenamenti, area atleti, prenotazione campi e shop merchandising dell'associazione sportiva ASD Verona Beach Volley.
**Target Users:**
- **Atleti** iscritti all'associazione (~136 atleti attuali, suddivisi in 17 gruppi)
- **Admin/Staff** dell'associazione (gestione completa tramite dashboard)
- **Visitatori** interessati al merchandising e informazioni generali

**Core Problem:** Attualmente la gestione di atleti, presenze, recuperi, pagamenti, certificati medici e merchandising avviene manualmente tramite fogli Excel e comunicazioni WhatsApp. Questo causa errori, ritardi, mancanza di visibilità e inefficienza operativa. Serve una piattaforma centralizzata mobile-first che digitalizzi tutti i processi.

**Sede:** Via B. Longhena, 22 — 37138 Verona
**P.IVA:** IT05167170231
**Email admin:** asdveronabeachvolley@gmail.com

---

## Goals

1. **Digitalizzare la gestione operativa** — Sostituire i fogli Excel con un sistema web per gruppi, presenze, recuperi, certificati e pagamenti
2. **Empowerment degli atleti** — Area riservata per visualizzare propri dati, caricare documenti, ricevere promemoria pagamenti
3. **Generare ricavi aggiuntivi** — E-commerce per merchandising (magliette VRB, felpe, accessori) e prenotazione campi sabato
4. **Mobile-first experience** — Interfaccia ottimizzata per smartphone con gesti touch, bottom navigation

---

## Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Autenticazione email/password per atleti e admin con Supabase Auth | Critical |
| FR-02 | Profilo atleta: dati personali, taglia maglietta, contatto, foto | Critical |
| FR-03 | Upload e gestione certificati medici (agonistico/non agonistico) con scadenza e semaforo | Critical |
| FR-04 | Gestione gruppi: 17 gruppi con ID, nome, allenatore, macro-categoria (M/F), livello (Base/Medio/Pro) | Critical |
| FR-05 | Calendario allenamenti settimanale (Lun-Ven), fasce orarie 18:30-20:00 e 20:00-21:30 | Critical |
| FR-06 | Registrazione presenze per sessione (Presente S/N) con conteggio automatico | Critical |
| FR-07 | Sistema recuperi: assenze da recuperare, prenotazione recupero in gruppo stesso livello, tracking completamento | Critical |
| FR-08 | Gestione pagamenti: quota stagionale (480-860 EUR), quota associativa (15 EUR), pagato, saldo, semaforo | Critical |
| FR-09 | Promemoria pagamenti: notifica visiva all'accesso se in scadenza/ritardo, email automatica | High |
| FR-10 | Blocco funzionalità per morosità: visualizzazione ok, prenotazione bloccata | High |
| FR-11 | Admin dashboard con gestione completa: spostamento atleti, caricamento iscritti, creazione gruppi, oversight pagamenti | Critical |
| FR-12 | Prenotazione campi beach volley per il sabato | High |
| FR-13 | E-commerce catalogo: prodotti merchandising con immagini, taglie disponibili, prezzi | High |
| FR-14 | Carrello e processo ordine per merchandising | High |
| FR-15 | Sezione promozioni e sconti con strutture convenzionate | Medium |
| FR-16 | Storico presenze per atleta (presenze, assenze, recuperi fatti, recuperi da programmare) | High |
| FR-17 | Log modifiche admin (spostamento atleti tra gruppi, modifiche forzate) | Medium |
| FR-18 | Supporto WhatsApp Business API per assistenza | Low |

---

## Non-Functional Requirements

- **Performance:** Pagina iniziale < 2s su 3G, interazioni UI < 100ms, ottimizzazione immagini per mobile
- **Security:** Row Level Security (RLS) su Supabase — atleti vedono solo propri dati, admin accesso completo. Auth email/password con conferma. Protezione upload file (solo PDF/JPG/PNG, max 5MB per certificati)
- **Availability:** 99.5% uptime (Supabase + hosting cloud). Funzionamento offline limitato (visualizzazione cache dati)
- **Scalability:** Supporto fino a 500 atleti e 50 gruppi. Immagini prodotti ottimizzate e servite via CDN
- **Accessibility:** WCAG 2.1 AA per interfacce principali. Contrasto sufficiente con palette arancione/nero/bianco
- **Mobile-First:** Touch targets min 44px, bottom navigation, swipe gestures, viewport ottimizzato

---

## Scope Boundaries

**In scope:**
- Sistema auth email/password con ruoli (atleta, admin)
- Dashboard admin per gestione completa
- Area atleta con profilo, documenti, presenze, pagamenti
- Gestione gruppi, allenamenti, presenze, recuperi
- Prenotazione campi sabato
- E-commerce catalogo con carrello (ordini manuali, no pagamento online v1)
- Promozioni e convenzioni
- Notifiche email per pagamenti
- Brand identity VRB (gradiente arancione-magenta/viola, logo Arena+giocatore)

**Out of scope (v1):**
- Pagamento online integrato (Stripe/PayPal) — solo tracking manuale pagamenti
- App nativa iOS/Android — solo PWA responsive
- Sistema di messaggistica interna / chat
- Integrazione calendario Google/Apple
- Gestione tornei e competizioni
- Streaming video allenamenti
- Multi-lingua (solo italiano)

---

## Success Metrics

- 100% degli atleti attuali (~136) migrati sulla piattaforma entro 30 giorni dal lancio
- Eliminazione completa del foglio Excel per gestione presenze e pagamenti
- Admin può completare la registrazione presenze per un gruppo in < 2 minuti
- Atleti accedono ai propri dati e caricano certificati autonomamente
- Tasso di adozione e-commerce: almeno 20% degli atleti effettua un ordine nel primo trimestre
- Zero errori di visibilità dati tra atleti (RLS verificato)
