# Setup Database — ASD Verona Beach Volley

## 📋 Prerequisiti

- Account Supabase con progetto creato
- Node.js 20+ installato
- Accesso alla dashboard Supabase

## 🗄️ Configurazione Database

### Step 1: Esegui Schema SQL

1. Vai alla [Dashboard Supabase SQL Editor](https://supabase.com/dashboard/project/dmmgoheojjzokrjtnsch/sql/new)
2. Copia e incolla il contenuto di **`supabase-schema.sql`**
3. Clicca "Run"
4. Ripeti con **`supabase-rls.sql`**

### Step 2: Crea Storage Buckets

Nella dashboard Supabase:
1. Vai su **Storage** > **New bucket**
2. Crea i seguenti bucket:
   - `certificates` (private)
   - `product-images` (public)
   - `avatars` (private)

### Step 3: Configura Environment

1. Ottieni la **Anon Key** dalla dashboard:
   - Settings > API > Project API keys > `anon public`

2. Aggiorna `.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://dmmgoheojjzokrjtnsch.supabase.co
   VITE_SUPABASE_ANON_KEY=tua-anon-key-qui
   ```

### Step 4: Crea Utente Admin

**Opzione A — Script automatico** (richiede Service Role Key):
```bash
SUPABASE_SERVICE_ROLE_KEY=tua-service-role-key npx tsx scripts/setup-database.ts
```

**Opzione B — Manuale**:
1. Vai su Authentication > Users > New user
2. Crea utente:
   - Email: `asdveronabeachvolley@gmail.com`
   - Password: `2626`
3. Conferma l'email
4. Vai in Table Editor > profiles
5. Trova l'utente creato e cambia `role` ad `admin`

## 🚀 Avvia l'Applicazione

```bash
npm run dev
```

L'app sarà disponibile su http://localhost:5173

## ✅ Verifica

1. Apri http://localhost:5173
2. Accedi con:
   - Email: `asdveronabeachvolley@gmail.com`
   - Password: `2626`
3. Dovresti vedere la Dashboard Admin

## 🔧 Risoluzione Problemi

### Errore: "Failed to fetch"
Verifica che le credenziali in `.env.local` siano corrette.

### Errore: "RLS policy violation"
Le RLS policies non sono state applicate. Riesegui `supabase-rls.sql`.

### Errore: "User not found"
L'utente admin non è stato creato. Usa l'Opzione B per crearlo manualmente.

## 📚 Risorse

- [Dashboard Supabase](https://supabase.com/dashboard/project/dmmgoheojjzokrjtnsch)
- [Documentazione Supabase](https://supabase.com/docs)
- [Project Ref](dmmgoheojjzokrjtnsch)
