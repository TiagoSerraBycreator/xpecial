-- Script para criar usuário admin no banco de produção
-- Execute este script no Supabase SQL Editor

-- 1. Garantir que a extensão pgcrypto está habilitada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Inserir usuário admin com hash bcrypt
INSERT INTO users (id, email, password, name, role, "isActive", "isEmailVerified", "createdAt", "updatedAt") 
VALUES (
  gen_random_uuid(), 
  'admin@xpecial.com', 
  '$2b$10$E9wVJM8zWbuaiRerR/jvUO0/iUr7QNoURcTsQwZLV/f9c6WcVSY9m', 
  'Admin', 
  'ADMIN',
  TRUE,
  TRUE,
  NOW(), 
  NOW()
) 
ON CONFLICT (email) DO UPDATE 
  SET password = EXCLUDED.password, 
      role = EXCLUDED.role,
      "isActive" = EXCLUDED."isActive",
      "isEmailVerified" = EXCLUDED."isEmailVerified",
      "updatedAt" = NOW();

-- 3. Confirmar que o usuário foi criado corretamente
SELECT 
  id, 
  email, 
  length(password) AS pass_len, 
  role, 
  "isActive",
  "isEmailVerified",
  "createdAt"
FROM users 
WHERE email = 'admin@xpecial.com';

-- Resultado esperado:
-- pass_len deve ser aproximadamente 60 (hash bcrypt)
-- role deve ser 'ADMIN'
-- isActive deve ser true
-- isEmailVerified deve ser true