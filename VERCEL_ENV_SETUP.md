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
DATABASE_URL=postgresql://postgres.fglvnmdjvsuqjicefddg:Desiree2205.01@aws-0-us-east-1.pooler.supabase.com:6543/postgres
POSTGRES_PRISMA_URL=postgresql://postgres.fglvnmdjvsuqjicefddg:Desiree2205.01@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgresql://postgres.fglvnmdjvsuqjicefddg:Desiree2205.01@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### ☁️ Supabase
```
SUPABASE_URL=https://fglvnmdjvsuqjicefddg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbHZubWRqdnN1cWppY2VmZGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODcxMTIsImV4cCI6MjA3MzQ2MzExMn0.QoRdOCG4ERj2M2pRG8RBVTxWZ7EFBhsF4ymgR3DO0qw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbHZubWRqdnN1cWppY2VmZGRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg4NzExMiwiZXhwIjoyMDczNDYzMTEyfQ.QoRdOCG4ERj2M2pRG8RBVTxWZ7EFBhsF4ymgR3DO0qw
SUPABASE_JWT_SECRET=Desiree2205.01
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