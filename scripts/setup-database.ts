/**
 * Script per configurare il database Supabase
 * 
 * Da eseguire con:
 * npx tsx scripts/setup-database.ts
 * 
 * Richiede:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (necessaria per operazioni admin)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dmmgoheojjzokrjtnsch.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('❌ Errore: SUPABASE_SERVICE_ROLE_KEY mancante')
  console.error('')
  console.error('Esempio:')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/setup-database.ts')
  process.exit(1)
}

console.log('🔗 Connessione a:', supabaseUrl)

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function executeSql(fileName: string): Promise<void> {
  console.log(`\n📄 Eseguendo ${fileName}...`)
  
  const filePath = path.join(process.cwd(), fileName)
  const sql = fs.readFileSync(filePath, 'utf-8')
  
  // Divide lo SQL in statement separati
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { 
        query: statement + ';' 
      })
      
      if (error) {
        // Se exec_sql non esiste, proviamo con query diretta
        const { error: queryError } = await supabase.from('_exec_sql').select('*').eq('query', statement + ';')
        if (queryError) {
          console.warn(`⚠️  Statement saltato: ${statement.substring(0, 50)}...`)
          console.warn(`   Errore: ${queryError.message}`)
        }
      }
    } catch (err) {
      console.warn(`⚠️  Errore nell'esecuzione: ${err}`)
    }
  }
  
  console.log(`✅ ${fileName} completato`)
}

async function createStorageBuckets(): Promise<void> {
  console.log('\n🪣 Creando storage buckets...')
  
  const buckets = ['certificates', 'product-images', 'avatars']
  
  for (const bucketName of buckets) {
    try {
      const { data: existing } = await supabase.storage.getBucket(bucketName)
      
      if (existing) {
        console.log(`  ℹ️  Bucket "${bucketName}" esiste già`)
      } else {
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: bucketName === 'product-images',
        })
        
        if (error) {
          console.error(`  ❌ Errore creazione bucket "${bucketName}": ${error.message}`)
        } else {
          console.log(`  ✅ Bucket "${bucketName}" creato`)
        }
      }
    } catch (err) {
      console.error(`  ❌ Errore bucket "${bucketName}": ${err}`)
    }
  }
}

async function seedAdminUser(): Promise<void> {
  console.log('\n👤 Creando utente admin...')
  
  const adminEmail = 'asdveronabeachvolley@gmail.com'
  const adminPassword = '2626'
  
  try {
    // Verifica se l'utente esiste già
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find(u => u.email === adminEmail)
    
    if (existingUser) {
      console.log(`  ℹ️  Utente admin "${adminEmail}" esiste già`)
      
      // Aggiorna il profilo ad admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin', full_name: 'Admin VRB' })
        .eq('id', existingUser.id)
      
      if (profileError) {
        console.error(`  ❌ Errore aggiornamento profilo: ${profileError.message}`)
      } else {
        console.log(`  ✅ Profilo admin aggiornato`)
      }
    } else {
      // Crea l'utente admin
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Admin VRB',
        },
      })
      
      if (createError) {
        console.error(`  ❌ Errore creazione utente: ${createError.message}`)
        return
      }
      
      if (newUser.user) {
        // Il profilo dovrebbe essere creato automaticamente dall'edge function on-signup
        // Ma aggiorniamo il ruolo ad admin
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', newUser.user.id)
        
        if (profileError) {
          console.error(`  ❌ Errore aggiornamento ruolo: ${profileError.message}`)
        } else {
          console.log(`  ✅ Utente admin creato: ${adminEmail}`)
          console.log(`     Password: ${adminPassword}`)
        }
      }
    }
  } catch (err) {
    console.error(`  ❌ Errore: ${err}`)
  }
}

async function main(): Promise<void> {
  console.log('🏐 ASD Verona Beach Volley — Database Setup')
  console.log('==========================================')
  
  try {
    // Nota: L'esecuzione diretta di SQL non è supportata via API REST
    // Gli script SQL devono essere eseguiti manualmente dalla dashboard
    
    console.log('\n⚠️  NOTA IMPORTANTE:')
    console.log('   Gli script SQL devono essere eseguiti manualmente dalla dashboard Supabase:')
    console.log('   1. Vai su https://supabase.com/dashboard/project/_/sql/new')
    console.log('   2. Copia e incolla il contenuto di:')
    console.log('      - supabase-schema.sql')
    console.log('      - supabase-rls.sql')
    console.log('')
    
    // Crea storage buckets
    await createStorageBuckets()
    
    // Seed utente admin
    await seedAdminUser()
    
    console.log('\n✅ Setup completato!')
    console.log('\nProssimi passi:')
    console.log('  1. Esegui gli script SQL dalla dashboard Supabase')
    console.log('  2. Verifica che l\'utente admin sia stato creato')
    console.log('  3. Aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY al file .env.local')
    
  } catch (error) {
    console.error('\n❌ Errore durante il setup:', error)
    process.exit(1)
  }
}

main()
