const https = require('https');

const SITE_URL = 'https://xpecial.vercel.app';

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function testAfterDeploy() {
    console.log('🚀 Testando após novo deploy...\n');
    
    // Aguardar um pouco para o deploy completar
    console.log('⏳ Aguardando 30 segundos para o deploy completar...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const tests = [
        { name: 'Página Principal', url: `${SITE_URL}` },
        { name: 'Página de Login', url: `${SITE_URL}/login` },
        { name: 'API Providers', url: `${SITE_URL}/api/auth/providers` },
        { name: 'API CSRF', url: `${SITE_URL}/api/auth/csrf` }
    ];
    
    for (const test of tests) {
        try {
            console.log(`\n🔍 Testando: ${test.name}`);
            console.log(`📍 URL: ${test.url}`);
            
            const response = await makeRequest(test.url);
            
            console.log(`📊 Status: ${response.status}`);
            console.log(`📋 Content-Type: ${response.headers['content-type'] || 'N/A'}`);
            
            if (response.status === 200) {
                console.log('✅ SUCESSO - Proteção removida!');
                
                // Se for a API de providers, mostrar o conteúdo
                if (test.url.includes('/providers')) {
                    try {
                        const providers = JSON.parse(response.body);
                        console.log('🔑 Providers disponíveis:', Object.keys(providers));
                    } catch (e) {
                        console.log('📄 Resposta (primeiros 200 chars):', response.body.substring(0, 200));
                    }
                }
            } else if (response.status === 401) {
                console.log('🔒 AINDA PROTEGIDO - Status 401');
                
                // Verificar se é proteção da Vercel
                if (response.body.includes('vercel') || response.body.includes('authentication')) {
                    console.log('🛡️ Proteção da Vercel ainda ativa');
                }
            } else {
                console.log(`⚠️ Status inesperado: ${response.status}`);
            }
            
        } catch (error) {
            console.log(`❌ Erro: ${error.message}`);
        }
    }
    
    console.log('\n📋 RESUMO:');
    console.log('1. Se todos os testes mostram status 200: ✅ Proteção removida com sucesso');
    console.log('2. Se ainda há status 401: 🔒 Proteção ainda ativa');
    console.log('3. Próximos passos se ainda protegido:');
    console.log('   - Verificar configurações da Vercel novamente');
    console.log('   - Aguardar mais tempo para propagação');
    console.log('   - Verificar se há proteção em nível de team/organization');
    console.log('   - Tentar acessar pelo navegador diretamente');
}

testAfterDeploy().catch(console.error);