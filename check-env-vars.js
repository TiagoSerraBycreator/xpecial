const { config } = require('dotenv');

// Carrega as variáveis de ambiente
config();

console.log('🔍 Verificando variáveis de ambiente do NextAuth...\n');

const requiredVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'DATABASE_URL'
];

const optionalVars = [
  'SMTP_HOST',
  'SMTP_PORT', 
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM'
];

let hasErrors = false;

console.log('📋 VARIÁVEIS OBRIGATÓRIAS:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName === 'NEXTAUTH_SECRET' ? '[DEFINIDO]' : value}`);
  } else {
    console.log(`❌ ${varName}: NÃO DEFINIDO`);
    hasErrors = true;
  }
});

console.log('\n📋 VARIÁVEIS OPCIONAIS (para email):');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('PASSWORD') ? '[DEFINIDO]' : value}`);
  } else {
    console.log(`⚠️  ${varName}: NÃO DEFINIDO`);
  }
});

console.log('\n🔧 DIAGNÓSTICO:');
if (hasErrors) {
  console.log('❌ Existem variáveis obrigatórias não definidas!');
  console.log('💡 Verifique se o arquivo .env existe e contém todas as variáveis necessárias.');
} else {
  console.log('✅ Todas as variáveis obrigatórias estão definidas!');
}

// Verificar se NEXTAUTH_URL está correto
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl && !nextAuthUrl.startsWith('http')) {
  console.log('⚠️  NEXTAUTH_URL deve começar com http:// ou https://');
  hasErrors = true;
}

// Verificar se NEXTAUTH_SECRET tem tamanho adequado
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (nextAuthSecret && nextAuthSecret.length < 32) {
  console.log('⚠️  NEXTAUTH_SECRET deve ter pelo menos 32 caracteres');
  hasErrors = true;
}

console.log('\n🎯 RESULTADO FINAL:');
if (hasErrors) {
  console.log('❌ Configuração com problemas - isso pode causar CLIENT_FETCH_ERROR');
  process.exit(1);
} else {
  console.log('✅ Configuração parece estar correta!');
  process.exit(0);
}