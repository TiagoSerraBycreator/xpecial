# 🚀 Configuração de Variáveis de Ambiente no Vercel

## 📋 Variáveis Obrigatórias

Acesse o painel do Vercel → Seu projeto → Settings → Environment Variables

### 🔐 NextAuth
```
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### 🗄️ Database (Supabase)
```
DATABASE_URL=postgres://postgres.gdblkhmwqytkzmyqttak:07ex7DZbW6YSsjFl@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_PRISMA_URL=postgres://postgres.gdblkhmwqytkzmyqttak:07ex7DZbW6YSsjFl@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgres://postgres.gdblkhmwqytkzmyqttak:07ex7DZbW6YSsjFl@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

### ☁️ Supabase
```
SUPABASE_URL=https://gdblkhmwqytkzmyqttak.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkYmxraG13cXl0a3pteXF0dGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDY5NzMsImV4cCI6MjA3Mzg4Mjk3M30.acPGfvOmDC4HnSAAgu7mPF1ftTj4XNyi32JhF3Kuet0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkYmxraG13cXl0a3pteXF0dGFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNjk3MywiZXhwIjoyMDczODgyOTczfQ.0GILTpyL-nKugFF6wS07_lgFm7Rw1EZVbmewdb_cMmA
SUPABASE_JWT_SECRET=j+Tgu3BGtw4Com/Q+DQzkNyBZSK42R0Ytg1LTdF8i6ZseM89s9iPfcDGnLt+VOy2EmiXegRNKmX024nYG8Ni5g==
```

### 🔧 Variáveis Adicionais do Postgres
```
POSTGRES_USER=postgres
POSTGRES_HOST=db.gdblkhmwqytkzmyqttak.supabase.co
POSTGRES_PASSWORD=07ex7DZbW6YSsjFl
POSTGRES_DATABASE=postgres
```

### 📧 Email (SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tiago.serra@bycreator.net
SMTP_PASSWORD=dtme ckyg jszw xloc
SMTP_FROM=tiago.serra@bycreator.net
```

## ⚠️ IMPORTANTE

1. **NEXTAUTH_URL**: Substitua `https://seu-dominio.vercel.app` pela URL real do seu projeto no Vercel
2. **Todas as variáveis** devem ser configuradas para **Production**, **Preview** e **Development**
3. **Não inclua aspas** ao inserir os valores no Vercel

## 🔄 Após Configurar

1. Faça um novo deploy ou aguarde o deploy automático
2. Execute o script para criar o usuário admin no banco de produção
3. Teste o login na versão de produção

## 🧪 Teste de Produção

Credenciais para teste:
- **Email**: admin@xpecial.com
- **Senha**: admin123