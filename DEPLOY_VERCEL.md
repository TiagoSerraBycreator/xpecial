# Guia de Deploy no Vercel - Xpecial

## Problemas Corrigidos

✅ **Erro de importação do MainLayout**: Corrigido import em `verify-email/page.tsx`
✅ **Erro de require() em email.ts**: Substituído por import ES modules
✅ **Problemas de build**: Removido `--turbopack` para compatibilidade
✅ **Configuração do Prisma**: Adicionado script `postinstall` para gerar cliente automaticamente
✅ **Configuração do Vercel**: Criado `vercel.json` com configurações otimizadas

## Passos para Deploy no Vercel

### 1. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel, configure as seguintes variáveis de ambiente:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres?schema=public

# NextAuth.js
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=seu-secret-super-seguro-aqui

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
SMTP_FROM=seu-email@gmail.com
```

### 2. Configurar Banco de Dados Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL de conexão PostgreSQL
4. Execute as migrações:

```bash
npx prisma db push
```

### 3. Deploy no Vercel

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. O deploy será automático com as configurações do `vercel.json`

### 4. Configurações Importantes

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### package.json
```json
{
  "scripts": {
    "build": "next build",
    "postinstall": "prisma generate"
  }
}
```

## Verificações Pós-Deploy

1. ✅ Build passa sem erros
2. ✅ Prisma Client é gerado automaticamente
3. ✅ APIs funcionam com timeout adequado
4. ✅ Banco de dados conecta corretamente
5. ✅ Autenticação NextAuth funciona
6. ✅ Envio de emails funciona

## Troubleshooting

### Erro de Build
- Verifique se todas as importações estão corretas
- Confirme que não há `require()` em arquivos TypeScript
- Verifique se o `postinstall` está gerando o Prisma Client

### Erro de Database
- Confirme a URL do banco no Supabase
- Verifique se as migrações foram aplicadas
- Teste a conexão localmente primeiro

### Erro de Email
- Confirme as credenciais SMTP
- Para Gmail, use senha de app (não a senha normal)
- Verifique se a autenticação 2FA está ativada

## Status Atual

✅ **Código corrigido e commitado**
✅ **Build local funcionando**
✅ **Configurações do Vercel criadas**
✅ **Guia de deploy documentado**

O projeto está pronto para deploy no Vercel!