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

async function testExactBrowserRequest() {
    console.log('🌐 Simulando exatamente a requisição do navegador...\n');
    
    try {
        // 1. Obter CSRF token
        console.log('1️⃣ Obtendo CSRF token...');
        const csrfResponse = await makeRequest(`${SITE_URL}/api/auth/csrf`);
        
        if (csrfResponse.status !== 200) {
            throw new Error(`Erro ao obter CSRF: ${csrfResponse.status}`);
        }
        
        const csrfData = JSON.parse(csrfResponse.body);
        const csrfToken = csrfData.csrfToken;
        console.log(`✅ CSRF Token: ${csrfToken.substring(0, 20)}...`);
        
        // 2. Testar com admin@xpecial.com (que você estava usando)
        console.log('\n2️⃣ Testando com admin@xpecial.com...');
        await testLogin('admin@xpecial.com', 'admin123', csrfToken);
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // 3. Testar com admin@admin.com
        console.log('3️⃣ Testando com admin@admin.com...');
        await testLogin('admin@admin.com', 'admin123', csrfToken);
        
    } catch (error) {
        console.log(`❌ Erro durante o teste: ${error.message}`);
    }
}

async function testLogin(email, password, csrfToken) {
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Senha: ${password}`);
    
    // Simular exatamente o que o NextAuth faz
    const loginData = querystring.stringify({
        email: email,
        password: password,
        csrfToken: csrfToken,
        callbackUrl: `${SITE_URL}`,
        json: 'true'
    });
    
    console.log('📦 Dados enviados:', {
        email: email,
        password: '***',
        csrfToken: csrfToken.substring(0, 20) + '...',
        callbackUrl: `${SITE_URL}`,
        json: 'true'
    });
    
    const loginOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(loginData),
            'Cookie': `next-auth.csrf-token=${csrfToken}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Referer': `${SITE_URL}/login`,
            'Origin': SITE_URL
        },
        body: loginData
    };
    
    console.log('📋 Headers enviados:', {
        'Content-Type': loginOptions.headers['Content-Type'],
        'Cookie': loginOptions.headers['Cookie'].substring(0, 50) + '...',
        'Origin': loginOptions.headers['Origin'],
        'Referer': loginOptions.headers['Referer']
    });
    
    const loginResponse = await makeRequest(`${SITE_URL}/api/auth/callback/credentials`, loginOptions);
    
    console.log(`📊 Status: ${loginResponse.status}`);
    console.log(`📋 Content-Type: ${loginResponse.headers['content-type'] || 'N/A'}`);
    
    if (loginResponse.headers['set-cookie']) {
        console.log('🍪 Cookies recebidos:');
        loginResponse.headers['set-cookie'].forEach(cookie => {
            if (cookie.includes('next-auth')) {
                console.log(`   ${cookie.split(';')[0]}`);
            }
        });
    }
    
    if (loginResponse.status === 200) {
        console.log('✅ SUCESSO!');
        try {
            const result = JSON.parse(loginResponse.body);
            console.log('📄 Resposta JSON:', result);
        } catch (e) {
            console.log('📄 Resposta (texto):', loginResponse.body.substring(0, 200));
        }
    } else if (loginResponse.status === 401) {
        console.log('❌ ERRO 401 - Unauthorized');
        console.log('📄 Resposta:', loginResponse.body.substring(0, 300));
    } else if (loginResponse.status === 302 || loginResponse.status === 307) {
        console.log('🔄 REDIRECIONAMENTO');
        const location = loginResponse.headers.location;
        if (location) {
            console.log(`🔗 Location: ${location}`);
        }
    } else {
        console.log(`⚠️ Status inesperado: ${loginResponse.status}`);
        console.log('📄 Resposta:', loginResponse.body.substring(0, 200));
    }
}

testExactBrowserRequest().catch(console.error);