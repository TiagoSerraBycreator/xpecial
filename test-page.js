const puppeteer = require('puppeteer');

async function testActivationPage() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Interceptar logs do console
  page.on('console', msg => {
    console.log('Console:', msg.text());
  });
  
  // Interceptar erros
  page.on('pageerror', error => {
    console.log('Page Error:', error.message);
  });
  
  try {
    console.log('Navegando para a página de ativação...');
    await page.goto('http://localhost:3000/ativar-conta?token=new-test-token-456', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Aguardar um pouco para ver se a página carrega
    await page.waitForTimeout(5000);
    
    // Verificar se há elementos na página
    const title = await page.title();
    console.log('Título da página:', title);
    
    // Verificar se há algum texto específico
    const content = await page.content();
    console.log('Página carregou com sucesso');
    
    // Aguardar mais um pouco para ver se há mudanças
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Erro ao testar a página:', error);
  } finally {
    await browser.close();
  }
}

testActivationPage();