# 🚀 Deploy ASD Verona Beach Volley su Vercel

## 📋 Prerequisiti

- Account Vercel (gratuito su https://vercel.com)
- Account GitHub (la repo è già creata)
- Account Supabase (già configurato)

## 🔗 Repository GitHub

La repository è disponibile su:
**https://github.com/slemo54/asd-verona-beach-volley**

## ⚡ Deploy Rapido su Vercel

### Metodo 1: Deploy tramite Vercel Dashboard (Consigliato)

1. **Vai su https://vercel.com e accedi**

2. **Clicca "Add New Project"**

3. **Importa la repository GitHub:**
   - Cerca "asd-verona-beach-volley"
   - Seleziona la repository
   - Clicca "Import"

4. **Configura il progetto:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (lascia così)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Aggiungi le Environment Variables:**
   ```
   VITE_SUPABASE_URL=https://dmmgoheojjzokrjtnsch.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   > ⚠️ **IMPORTANTE:** Usa la tua `VITE_SUPABASE_ANON_KEY` reale dal file `.env.local`

6. **Clicca "Deploy"**

7. **Attendi il deploy** (2-3 minuti)

### Metodo 2: Deploy tramite Vercel CLI

```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /Users/Anselmo/Downloads/asd-verona-beach-volley
vercel --prod
```

## 🔧 Configurazione Post-Deploy

### 1. Configura il Dominio (opzionale)

Nel dashboard Vercel:
- Vai su "Settings" → "Domains"
- Aggiungi il tuo dominio personalizzato (es. `veronabeachvolley.it`)
- Segui le istruzioni per configurare i DNS

### 2. Verifica Supabase CORS

Assicurati che il dominio Vercel sia autorizzato in Supabase:
1. Vai su https://supabase.com/dashboard
2. Seleziona il progetto `dmmgoheojjzokrjtnsch`
3. Vai su "Authentication" → "URL Configuration"
4. Aggiungi il tuo dominio Vercel ai "Redirect URLs"

### 3. Configura Email (per produzione)

Per attivare le notifiche email (reset password, etc.):
1. In Supabase: "Authentication" → "Email Templates"
2. Configura SendGrid/Resend nelle "Project Settings" → "Integrations"

## 📁 File Importanti

| File | Descrizione |
|------|-------------|
| `.env.local` | Variabili d'ambiente locali (NON committare) |
| `vercel.json` | Configurazione deploy Vercel |
| `vite.config.ts` | Configurazione build Vite |

## ✅ Checklist Pre-Deploy

- [ ] Build locale funzionante (`npm run build`)
- [ ] Nessun errore TypeScript
- [ ] Variabili d'ambiente configurate su Vercel
- [ ] Immagini in `public/` (logo, prodotti)
- [ ] Supabase URL Configuration aggiornato

## 🐛 Troubleshooting

### Schermo nero dopo deploy
- Verifica che le env vars siano correttamente impostate
- Controlla i log in Vercel Dashboard → "Deployments" → "Logs"

### Errore CORS
- Aggiungi il dominio Vercel in Supabase Auth URL Configuration
- Verifica RLS policies su Supabase

### Immagini non caricate
- Verifica che siano in `public/` e non in `src/`
- Controlla i path (devono iniziare con `/`)

## 📞 Supporto

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Repo:** https://github.com/slemo54/asd-verona-beach-volley

---

**Data creazione:** 2026-02-16  
**Versione:** 1.0.0
