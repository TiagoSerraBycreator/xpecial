# Configuração SMTP para Gmail

## Problema Comum: "Falha na conexão SMTP"

### Causa Principal
O Gmail requer uma **Senha de App** em vez da senha normal da conta para aplicações externas.

### Solução: Configurar Senha de App

1. **Ativar Verificação em 2 Etapas**:
   - Acesse: https://myaccount.google.com/security
   - Ative a "Verificação em 2 etapas"

2. **Gerar Senha de App**:
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "App" → "Outro (nome personalizado)"
   - Digite: "Xpecial SMTP"
   - Clique em "Gerar"
   - **Copie a senha de 16 caracteres gerada**

3. **Atualizar .env.local**:
   ```
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Senha de App (16 caracteres)
   ```

### Configurações Recomendadas para Gmail:
- **Host**: smtp.gmail.com
- **Porta**: 587
- **SSL**: Desabilitado (TLS será usado)
- **Usuário**: tiago.serra@bycreator.net
- **Senha**: dtme ckyg jszw xloc

### Teste
Após configurar a Senha de App, teste novamente o envio de email.