-- ============================================
-- ASD Verona Beach Volley — Seed Data
-- ============================================

-- Inserisci utente admin (richiede l'UUID dell'utente creato in auth.users)
-- Nota: Devi prima creare l'utente in Auth > Users, poi ottenere il suo UUID

-- Esempio (sostituisci l'UUID con quello reale dell'utente):
-- INSERT INTO profiles (id, email, full_name, role, is_moroso)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000',  -- Sostituisci con UUID reale
--   'asdveronabeachvolley@gmail.com',
--   'Admin VRB',
--   'admin',
--   false
-- )
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Inserisci gruppi di allenamento (esempi)
INSERT INTO groups (name, macro_category, level, day_of_week, time_slot, max_athletes)
VALUES 
  ('U18 Femminile Base', 'female', 'base', 1, '18:30-20:00', 12),
  ('U18 Femminile Pro', 'female', 'pro', 1, '20:00-21:30', 10),
  ('U16 Maschile Base', 'male', 'base', 2, '18:30-20:00', 12),
  ('U16 Maschile Pro', 'male', 'pro', 2, '20:00-21:30', 10),
  ('Adulti Femminile', 'female', 'medium', 3, '18:30-20:00', 14),
  ('Adulti Maschile', 'male', 'medium', 3, '20:00-21:30', 14)
ON CONFLICT DO NOTHING;

-- Inserisci prodotti shop (esempi)
INSERT INTO products (name, description, price, category, available_sizes, stock)
VALUES 
  (
    'Maglietta VRB Classic', 
    'Maglietta ufficiale ASD Verona Beach Volley, 100% cotone',
    25.00,
    'tshirt',
    '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
    50
  ),
  (
    'Felpa VRB Hoodie',
    'Felpa con cappuccio VRB, interno felpato',
    45.00,
    'sweatshirt',
    '["S", "M", "L", "XL", "XXL"]'::jsonb,
    30
  ),
  (
    'Pallone Beach Volley',
    'Pallone ufficiale per beach volley',
    35.00,
    'accessory',
    '[]'::jsonb,
    20
  )
ON CONFLICT DO NOTHING;

-- Inserisci promozioni (esempi)
INSERT INTO promotions (title, description, partner_name, discount_type, discount_value, valid_from, valid_until)
VALUES 
  (
    'Sconto 10% Palestra XYZ',
    'Sconto del 10% su abbonamento mensile',
    'Palestra XYZ Verona',
    'percentage',
    10.00,
    '2026-01-01',
    '2026-12-31'
  ),
  (
    'Sconto 5€ Fisioterapia',
    'Sconto di 5€ su prima visita',
    'Fisiomedica Verona',
    'fixed',
    5.00,
    '2026-01-01',
    '2026-12-31'
  )
ON CONFLICT DO NOTHING;
