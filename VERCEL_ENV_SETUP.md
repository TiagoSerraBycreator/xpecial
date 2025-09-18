# 🚀 Configuração de Variáveis de Ambiente no Vercel

## 📋 Variáveis Obrigatórias para Produção

Copie e cole essas variáveis no painel do Vercel:

### 🗄️ **Banco de Dados (Supabase)**
```
DATABASE_URL=postgresql://postgres:Desiree2205%2E01@db.fglvnmdjvsuqjicefddg.supabase.co:5432/postgres?schema=public
SUPABASE_URL=https://fglvnmdjvsuqjicefddg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbHZubWRqdnN1cWppY2VmZGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODcxMTIsImV4cCI6MjA3MzQ2MzExMn0.QoRdOCG4ERj2M2pRG8RBVTxWZ7EFBhsF4ymgR3DO0qw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbHZubWRqdnN1cWppY2VmZGRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg4NzExMiwiZXhwIjoyMDczNDYzMTEyfQ.QoRdOCG4ERj2M2pRG8RBVTxWZ7EFBhsF4ymgR3DO0qw
```

### 🔐 **Autenticação (NextAuth.js)**
```
NEXTAUTH_SECRET=c0166b2a934aa2eb8242ddc24b7d1d449b8410db40049df520713aec82dd9d8b
NEXTAUTH_URL=https://xpecial-git-main-tiagos-projects-39da614a.vercel.app/

```
> ⚠️ **IMPORTANTE**: Substitua `SEU-DOMINIO-VERCEL` pelo domínio real que o Vercel gerar para você!

---

## 🛠️ Como Configurar no Vercel

### 1. **Acesse o Painel do Vercel**
- Vá para [vercel.com](https://vercel.com)
- Faça login na sua conta

### 2. **Importe o Projeto**
- Clique em "New Project"
- Conecte seu GitHub
- Selecione o repositório `Xpecial`

### 3. **Configure as Variáveis de Ambiente**
- Na tela de configuração do projeto, vá em "Environment Variables"
- Adicione **TODAS** as variáveis listadas acima
- **ATENÇÃO**: Copie exatamente como está, incluindo as aspas se houver

### 4. **Configurações de Build**
- Framework Preset: `Next.js`
- Build Command: `npm run build` (já configurado)
- Output Directory: `.next` (padrão)

### 5. **Deploy**
- Clique em "Deploy"
- Aguarde o build terminar

---

## ✅ Após o Deploy

### 1. **Atualize o NEXTAUTH_URL**
- Copie a URL final do seu site (ex: `https://xpecial-abc123.vercel.app`)
- Volte em "Settings" > "Environment Variables"
- Edite a variável `NEXTAUTH_URL` com a URL real
- Faça um novo deploy

### 2. **Configure o SMTP no Painel Admin**
- Acesse: `https://sua-url.vercel.app/admin`
- Vá em "Configurações do Sistema"
- Configure o Gmail SMTP:
  - **Host**: `smtp.gmail.com`
  - **Porta**: `587`
  - **Email**: seu-email@gmail.com
  - **Senha**: senha de aplicativo do Gmail
  - **Segurança**: TLS

---

## 🔧 Troubleshooting

### Se der erro de build:
1. Verifique se todas as variáveis foram copiadas corretamente
2. Certifique-se que não há espaços extras
3. Verifique se o `NEXTAUTH_URL` está correto

### Se der erro de banco:
1. Verifique se o Supabase está ativo
2. Confirme se a `DATABASE_URL` está correta
3. Teste a conexão localmente primeiro

---

## 📞 Status Atual
- ✅ Banco de dados: Configurado e funcionando
- ✅ Migrações: Aplicadas no Supabase  
- ✅ Build local: Funcionando
- ✅ Variáveis: Preparadas para produção
- 🔄 **PRÓXIMO PASSO**: Configurar no Vercel

---

**🎯 Está tudo pronto para o deploy! Siga o guia acima e me avise se precisar de ajuda.**