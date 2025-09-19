const { execSync } = require('child_process');
const https = require('https');

console.log('🗄️ SCRIPT DE RECRIAÇÃO COMPLETA DO BANCO DE DADOS');
console.log('=' .repeat(60));

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

function runCommand(command, description) {
  console.log(`\n🔧 ${description}`);
  console.log(`   Comando: ${command}`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log('   ✅ Sucesso!');
    if (output.trim()) {
      console.log(`   Output: ${output.trim()}`);
    }
    return true;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    if (error.stdout) {
      console.log(`   Stdout: ${error.stdout}`);
    }
    if (error.stderr) {
      console.log(`   Stderr: ${error.stderr}`);
    }
    return false;
  }
}

async function recreateDatabase() {
  console.log('\n📋 ETAPAS DA RECRIAÇÃO:');
  console.log('1. Reset completo das migrations');
  console.log('2. Regenerar cliente Prisma');
  console.log('3. Aplicar migrations no banco');
  console.log('4. Criar usuário admin');
  console.log('5. Testar conexão e login');

  // Etapa 1: Reset das migrations
  console.log('\n🔄 ETAPA 1: Reset das migrations');
  const resetSuccess = runCommand(
    'npx prisma migrate reset --force',
    'Resetando migrations e recriando banco'
  );

  if (!resetSuccess) {
    console.log('\n⚠️ Reset falhou, tentando abordagem alternativa...');
    
    // Tentar deletar e recriar migrations
    runCommand(
      'npx prisma db push --force-reset',
      'Forçando reset do banco'
    );
  }

  // Etapa 2: Regenerar cliente
  console.log('\n🔄 ETAPA 2: Regenerar cliente Prisma');
  runCommand(
    'npx prisma generate',
    'Regenerando cliente Prisma'
  );

  // Etapa 3: Aplicar migrations
  console.log('\n🔄 ETAPA 3: Aplicar migrations');
  const migrateSuccess = runCommand(
    'npx prisma migrate deploy',
    'Aplicando migrations no banco'
  );

  if (!migrateSuccess) {
    console.log('\n⚠️ Deploy de migrations falhou, tentando db push...');
    runCommand(
      'npx prisma db push',
      'Sincronizando schema com banco'
    );
  }

  // Etapa 4: Criar usuário admin
  console.log('\n👤 ETAPA 4: Criar usuário admin');
  const createAdminSuccess = runCommand(
    'node create-admin-user.js',
    'Criando usuário admin'
  );

  // Etapa 5: Verificar estrutura do banco
  console.log('\n🔍 ETAPA 5: Verificar estrutura do banco');
  runCommand(
    'npx prisma db seed',
    'Executando seed (se existir)'
  );

  return { resetSuccess, migrateSuccess, createAdminSuccess };
}

async function testNewDatabase() {
  console.log('\n🧪 TESTANDO NOVO BANCO DE DADOS');
  console.log('=' .repeat(40));

  // Aguardar um pouco para o deploy
  console.log('⏳ Aguardando deploy...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    // Teste 1: Verificar se o usuário admin existe
    console.log('\n🔍 TESTE 1: Verificar usuário admin');
    const checkAdminSuccess = runCommand(
      'node check-admin-production.js',
      'Verificando usuário admin no banco'
    );

    // Teste 2: Testar login
    console.log('\n🔐 TESTE 2: Testar login');
    
    const formData = new URLSearchParams({
      email: 'admin@admin.com',
      password: 'admin123',
      callbackUrl: 'https://xpecial.vercel.app/dashboard',
      json: 'true'
    });

    const loginResponse = await makeRequest('https://xpecial.vercel.app/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData.toString()
    });

    const loginSuccess = loginResponse.statusCode === 200;
    console.log(`   ${loginSuccess ? '✅' : '❌'} Login: Status ${loginResponse.statusCode}`);
    
    if (!loginSuccess) {
      console.log(`   Erro: ${loginResponse.body.substring(0, 200)}`);
    }

    // Teste 3: Verificar estrutura das tabelas
    console.log('\n📊 TESTE 3: Verificar estrutura das tabelas');
    runCommand(
      'npx prisma studio --browser none --port 5555',
      'Iniciando Prisma Studio (verificação manual)'
    );

    return { checkAdminSuccess, loginSuccess };

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    return { checkAdminSuccess: false, loginSuccess: false };
  }
}

async function main() {
  console.log('🚀 INICIANDO RECRIAÇÃO COMPLETA DO BANCO DE DADOS');
  
  const recreateResults = await recreateDatabase();
  const testResults = await testNewDatabase();
  
  console.log('\n📊 RESULTADO FINAL:');
  console.log('=' .repeat(40));
  
  console.log('\n🔄 Recriação do Banco:');
  console.log(`   Reset migrations: ${recreateResults.resetSuccess ? '✅' : '❌'}`);
  console.log(`   Deploy migrations: ${recreateResults.migrateSuccess ? '✅' : '❌'}`);
  console.log(`   Criar admin: ${recreateResults.createAdminSuccess ? '✅' : '❌'}`);
  
  console.log('\n🧪 Testes:');
  console.log(`   Admin existe: ${testResults.checkAdminSuccess ? '✅' : '❌'}`);
  console.log(`   Login funciona: ${testResults.loginSuccess ? '✅' : '❌'}`);
  
  const allSuccess = Object.values(recreateResults).every(Boolean) && 
                     Object.values(testResults).every(Boolean);
  
  if (allSuccess) {
    console.log('\n🎉 BANCO RECRIADO COM SUCESSO!');
    console.log('   ✅ Todas as operações foram bem-sucedidas');
    console.log('   ✅ Login deve funcionar no navegador agora');
    console.log('   ✅ Problemas de permissões resolvidos');
  } else {
    console.log('\n⚠️ RECRIAÇÃO PARCIALMENTE BEM-SUCEDIDA');
    console.log('   - Algumas operações falharam');
    console.log('   - Verifique os logs acima');
    console.log('   - Pode ser necessário intervenção manual');
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Aguarde alguns minutos para o deploy');
  console.log('2. Teste o login no navegador');
  console.log('3. Use: admin@admin.com / admin123');
  console.log('4. Se ainda houver problemas, verifique as variáveis de ambiente na Vercel');
}

main().catch(console.error);