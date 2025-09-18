const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testNextAuthRoutes() {
  console.log('🧪 Testando rotas do NextAuth...\n');

  const routes = [
    '/api/auth/providers',
    '/api/auth/session',
    '/api/auth/csrf',
    '/api/auth/signin',
    '/api/auth/signout'
  ];

  for (const route of routes) {
    try {
      console.log(`🔍 Testando: ${route}`);
      
      const response = await fetch(`${BASE_URL}${route}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log(`   ✅ Resposta JSON válida`);
          
          // Log específico para cada rota
          if (route === '/api/auth/providers') {
            console.log(`   📋 Providers: ${Object.keys(data).join(', ')}`);
          } else if (route === '/api/auth/session') {
            console.log(`   👤 Session: ${data.user ? 'Logado' : 'Não logado'}`);
          } else if (route === '/api/auth/csrf') {
            console.log(`   🔐 CSRF Token: ${data.csrfToken ? 'Presente' : 'Ausente'}`);
          }
        } else {
          console.log(`   ✅ Resposta não-JSON (${contentType})`);
        }
      } else {
        console.log(`   ❌ Erro na resposta`);
        const text = await response.text();
        console.log(`   📄 Conteúdo: ${text.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erro de conexão: ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('   💡 Servidor não está rodando ou não está acessível');
        break;
      }
    }
    
    console.log(''); // Linha em branco
  }

  // Teste específico para CLIENT_FETCH_ERROR
  console.log('🔍 Teste específico para CLIENT_FETCH_ERROR...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/session`, {
      method: 'GET',
      headers: {
        'User-Agent': 'NextAuth.js Client',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Rota /api/auth/session acessível - CLIENT_FETCH_ERROR pode ser outro problema');
    } else {
      console.log(`❌ Problema na rota /api/auth/session: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ CLIENT_FETCH_ERROR confirmado: ${error.message}`);
  }

  console.log('\n🎯 DIAGNÓSTICO FINAL:');
  console.log('Se todas as rotas estão funcionando, o CLIENT_FETCH_ERROR pode ser:');
  console.log('1. 🌐 Problema de CORS');
  console.log('2. 🔧 Configuração incorreta no cliente');
  console.log('3. 🚫 Middleware bloqueando requisições');
  console.log('4. 🔄 Cache do navegador');
  console.log('5. 🐛 Bug no código do cliente');
}

testNextAuthRoutes().catch(console.error);