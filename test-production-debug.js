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

async function debugProductionIssue() {
    console.log('🔍 Debugando problema específico de produção...\n');
    
    try {
        // 1. Verificar se a API de providers está funcionando
        console.log('1️⃣ Verificando API de providers...');
        const providersResponse = await makeRequest(`${SITE_URL}/api/auth/providers`);
        console.log(`📊 Status: ${providersResponse.status}`);
        
        if (providersResponse.status === 200) {
            const providers = JSON.parse(providersResponse.body);
            console.log('✅ Providers disponíveis:', Object.keys(providers));
            console.log('🔧 Configuração do provider credentials:', providers.credentials);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 2. Verificar configuração do NextAuth
        console.log('2️⃣ Verificando configuração do NextAuth...');
        const configResponse = await makeRequest(`${SITE_URL}/api/auth/session`);
        console.log(`📊 Status da sessão: ${configResponse.status}`);
        
        if (configResponse.status === 200) {
            try {
                const session = JSON.parse(configResponse.body);
                console.log('📄 Sessão atual:', session);
            } catch (e) {
                console.log('📄 Resposta da sessão:', configResponse.body);
            }
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 3. Testar com diferentes User-Agents
        console.log('3️⃣ Testando com diferentes User-Agents...');
        
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
            'Node.js Test Script'
        ];
        
        for (const userAgent of userAgents) {
            console.log(`\n🌐 Testando com User-Agent: ${userAgent.substring(0, 50)}...`);
            await testLoginWithUserAgent(userAgent);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 4. Verificar headers específicos
        console.log('4️⃣ Verificando headers específicos...');
        await testWithSpecificHeaders();
        
    } catch (error) {
        console.log(`❌ Erro durante debug: ${error.message}`);
    }
}

async function testLoginWithUserAgent(userAgent) {
    try {
        // Obter CSRF
        const csrfResponse = await makeRequest(`${SITE_URL}/api/auth/csrf`);
        const csrfData = JSON.parse(csrfResponse.body);
        const csrfToken = csrfData.csrfToken;
        
        // Tentar login
        const loginData = querystring.stringify({
            email: 'admin@xpecial.com',
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
                'Cookie': `next-auth.csrf-token=${csrfToken}`,
                'User-Agent': userAgent,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                'Referer': `${SITE_URL}/login`,
                'Origin': SITE_URL
            },
            body: loginData
        };
        
        const loginResponse = await makeRequest(`${SITE_URL}/api/auth/callback/credentials`, loginOptions);
        console.log(`   📊 Status: ${loginResponse.status} ${loginResponse.status === 200 ? '✅' : '❌'}`);
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
    }
}

async function testWithSpecificHeaders() {
    try {
        // Obter CSRF
        const csrfResponse = await makeRequest(`${SITE_URL}/api/auth/csrf`);
        const csrfData = JSON.parse(csrfResponse.body);
        const csrfToken = csrfData.csrfToken;
        
        // Testar com headers mínimos (como o navegador pode estar fazendo)
        const loginData = querystring.stringify({
            email: 'admin@xpecial.com',
            password: 'admin123',
            csrfToken: csrfToken,
            callbackUrl: `${SITE_URL}`
        });
        
        console.log('🧪 Teste 1: Headers mínimos');
        const minimalOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(loginData),
                'Cookie': `next-auth.csrf-token=${csrfToken}`
            },
            body: loginData
        };
        
        const minimalResponse = await makeRequest(`${SITE_URL}/api/auth/callback/credentials`, minimalOptions);
        console.log(`   📊 Status: ${minimalResponse.status} ${minimalResponse.status === 200 ? '✅' : '❌'}`);
        
        console.log('\n🧪 Teste 2: Sem json=true');
        const noJsonData = querystring.stringify({
            email: 'admin@xpecial.com',
            password: 'admin123',
            csrfToken: csrfToken,
            callbackUrl: `${SITE_URL}`
        });
        
        const noJsonOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(noJsonData),
                'Cookie': `next-auth.csrf-token=${csrfToken}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': `${SITE_URL}/login`,
                'Origin': SITE_URL
            },
            body: noJsonData
        };
        
        const noJsonResponse = await makeRequest(`${SITE_URL}/api/auth/callback/credentials`, noJsonOptions);
        console.log(`   📊 Status: ${noJsonResponse.status} ${noJsonResponse.status === 200 || noJsonResponse.status === 302 ? '✅' : '❌'}`);
        
        if (noJsonResponse.status === 302) {
            console.log(`   🔗 Redirecionamento: ${noJsonResponse.headers.location}`);
        }
        
    } catch (error) {
        console.log(`❌ Erro: ${error.message}`);
    }
}

debugProductionIssue().catch(console.error);