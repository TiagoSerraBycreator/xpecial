const https = require('https');
const querystring = require('querystring');

const SITE_URL = 'https://xpecial.vercel.app';

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
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
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

async function testLoginFlow() {
    console.log('🔐 Testando fluxo completo de login...\n');
    
    try {
        // 1. Obter CSRF token
        console.log('1️⃣ Obtendo CSRF token...');
        const csrfResponse = await makeRequest(`${SITE_URL}/api/auth/csrf`);
        
        if (csrfResponse.status !== 200) {
            throw new Error(`Erro ao obter CSRF: ${csrfResponse.status}`);
        }
        
        const csrfData = JSON.parse(csrfResponse.body);
        const csrfToken = csrfData.csrfToken;
        console.log(`✅ CSRF Token obtido: ${csrfToken.substring(0, 20)}...`);
        
        // 2. Tentar login com credenciais
        console.log('\n2️⃣ Tentando login com credenciais admin...');
        
        const loginData = querystring.stringify({
            username: 'admin',
            password: 'admin123',
            csrfToken: csrfToken,
            callbackUrl: `${SITE_URL}`,
            json: 'true'
        });
        
        const loginOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(loginData),
                'Cookie': `next-auth.csrf-token=${csrfToken}`
            },
            body: loginData
        };
        
        const loginResponse = await makeRequest(`${SITE_URL}/api/auth/callback/credentials`, loginOptions);
        
        console.log(`📊 Status da resposta: ${loginResponse.status}`);
        console.log(`📋 Content-Type: ${loginResponse.headers['content-type'] || 'N/A'}`);
        
        if (loginResponse.status === 200) {
            console.log('✅ LOGIN SUCESSO!');
            
            try {
                const result = JSON.parse(loginResponse.body);
                console.log('📄 Resposta:', result);
                
                if (result.url) {
                    console.log(`🔗 Redirecionamento para: ${result.url}`);
                }
            } catch (e) {
                console.log('📄 Resposta (texto):', loginResponse.body.substring(0, 300));
            }
            
            // Verificar cookies de sessão
            const setCookies = loginResponse.headers['set-cookie'];
            if (setCookies) {
                console.log('🍪 Cookies de sessão definidos:');
                setCookies.forEach(cookie => {
                    if (cookie.includes('next-auth')) {
                        console.log(`   ${cookie.split(';')[0]}`);
                    }
                });
            }
            
        } else if (loginResponse.status === 401) {
            console.log('❌ LOGIN FALHOU - Credenciais inválidas');
            console.log('📄 Resposta:', loginResponse.body.substring(0, 200));
            
        } else if (loginResponse.status === 302 || loginResponse.status === 307) {
            console.log('🔄 REDIRECIONAMENTO - Possível sucesso');
            const location = loginResponse.headers.location;
            if (location) {
                console.log(`🔗 Redirecionando para: ${location}`);
                
                if (location.includes('/login') && location.includes('error')) {
                    console.log('❌ Redirecionamento para login com erro');
                } else {
                    console.log('✅ Redirecionamento parece indicar sucesso');
                }
            }
            
        } else {
            console.log(`⚠️ Status inesperado: ${loginResponse.status}`);
            console.log('📄 Resposta:', loginResponse.body.substring(0, 200));
        }
        
    } catch (error) {
        console.log(`❌ Erro durante o teste: ${error.message}`);
    }
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Se o login foi bem-sucedido: ✅ Problema resolvido!');
    console.log('2. Se ainda há erro 401: Verificar credenciais no banco de dados');
    console.log('3. Se há redirecionamento com erro: Verificar configuração do NextAuth');
    console.log('4. Testar também pelo navegador para confirmar');
}

testLoginFlow().catch(console.error);