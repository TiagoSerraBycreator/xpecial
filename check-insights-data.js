const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const applications = await prisma.application.findMany({
      include: {
        candidate: { include: { user: true } },
        job: { include: { company: true } }
      }
    });
    
    console.log('Total de candidaturas:', applications.length);
    
    if (applications.length > 0) {
      console.log('\nPrimeiras 3 candidaturas:');
      applications.slice(0, 3).forEach((app, index) => {
        console.log(`${index + 1}. ${app.candidate.user.name} -> ${app.job.title} (${app.job.company.name}) - Status: ${app.status}`);
      });
    }
    
    const certificates = await prisma.certificate.findMany();
    console.log('\nTotal de certificados:', certificates.length);
    
    // Verificar usuários candidatos
    const users = await prisma.user.findMany({
      where: { role: 'CANDIDATE' },
      include: { candidate: true }
    });
    console.log('\nUsuários candidatos:', users.length);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ID: ${user.id} - Candidate: ${user.candidate ? 'Sim' : 'Não'}`);
    });
    
    const candidates = await prisma.candidate.findMany({
      include: { user: true }
    });
    console.log('\nRegistros de candidatos:', candidates.length);
    candidates.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.user.name} - Candidate ID: ${candidate.id}`);
    });
    
    // Verificar empresas
    const companies = await prisma.user.findMany({
      where: { role: 'COMPANY' },
      include: { company: true }
    });
    console.log('\nEmpresas:', companies.length);
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name} - Company: ${company.company ? 'Sim' : 'Não'}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();