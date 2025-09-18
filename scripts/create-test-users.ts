import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('Criando 8 usuários candidatos teste...')
    
    const testUsers = [
      {
        name: 'Ana Silva',
        email: 'ana.silva@teste.com',
        phone: '(11) 99999-0001',
        city: 'São Paulo',
        state: 'SP',
        skills: 'JavaScript, React, Node.js',
        experience: 'Desenvolvedora Frontend com 3 anos de experiência',
        education: 'Bacharelado em Ciência da Computação',
        description: 'Apaixonada por tecnologia e desenvolvimento web'
      },
      {
        name: 'Carlos Santos',
        email: 'carlos.santos@teste.com',
        phone: '(11) 99999-0002',
        city: 'Rio de Janeiro',
        state: 'RJ',
        skills: 'Python, Django, PostgreSQL',
        experience: 'Desenvolvedor Backend com 5 anos de experiência',
        education: 'Tecnólogo em Sistemas de Informação',
        description: 'Especialista em arquitetura de sistemas'
      },
      {
        name: 'Maria Oliveira',
        email: 'maria.oliveira@teste.com',
        phone: '(11) 99999-0003',
        city: 'Belo Horizonte',
        state: 'MG',
        skills: 'Java, Spring Boot, MySQL',
        experience: 'Desenvolvedora Full Stack com 4 anos de experiência',
        education: 'Engenharia de Software',
        description: 'Focada em soluções escaláveis e eficientes'
      },
      {
        name: 'João Pereira',
        email: 'joao.pereira@teste.com',
        phone: '(11) 99999-0004',
        city: 'Porto Alegre',
        state: 'RS',
        skills: 'C#, .NET, SQL Server',
        experience: 'Desenvolvedor .NET com 6 anos de experiência',
        education: 'Bacharelado em Sistemas de Informação',
        description: 'Especialista em desenvolvimento corporativo'
      },
      {
        name: 'Fernanda Costa',
        email: 'fernanda.costa@teste.com',
        phone: '(11) 99999-0005',
        city: 'Curitiba',
        state: 'PR',
        skills: 'React Native, Flutter, Mobile Development',
        experience: 'Desenvolvedora Mobile com 3 anos de experiência',
        education: 'Análise e Desenvolvimento de Sistemas',
        description: 'Apaixonada por desenvolvimento mobile'
      },
      {
        name: 'Ricardo Lima',
        email: 'ricardo.lima@teste.com',
        phone: '(11) 99999-0006',
        city: 'Salvador',
        state: 'BA',
        skills: 'DevOps, AWS, Docker, Kubernetes',
        experience: 'Engenheiro DevOps com 7 anos de experiência',
        education: 'Engenharia da Computação',
        description: 'Especialista em infraestrutura e automação'
      },
      {
        name: 'Juliana Rodrigues',
        email: 'juliana.rodrigues@teste.com',
        phone: '(11) 99999-0007',
        city: 'Fortaleza',
        state: 'CE',
        skills: 'UX/UI Design, Figma, Adobe Creative Suite',
        experience: 'Designer UX/UI com 4 anos de experiência',
        education: 'Design Gráfico',
        description: 'Focada em experiência do usuário e interfaces intuitivas'
      },
      {
        name: 'Pedro Almeida',
        email: 'pedro.almeida@teste.com',
        phone: '(11) 99999-0008',
        city: 'Brasília',
        state: 'DF',
        skills: 'Data Science, Python, Machine Learning',
        experience: 'Cientista de Dados com 5 anos de experiência',
        education: 'Mestrado em Ciência da Computação',
        description: 'Especialista em análise de dados e inteligência artificial'
      }
    ]

    const hashedPassword = await bcrypt.hash('123456', 10)

    for (const userData of testUsers) {
      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: 'CANDIDATE'
        }
      })

      // Criar perfil do candidato
      await prisma.candidate.create({
        data: {
          userId: user.id,
          phone: userData.phone,
          city: userData.city,
          state: userData.state,
          skills: userData.skills,
          experience: userData.experience,
          education: userData.education,
          description: userData.description,
          aboutMe: userData.description,
          dateOfBirth: new Date('1990-01-01')
        }
      })

      console.log(`✓ Usuário criado: ${userData.name} (${userData.email})`)
    }

    console.log('\n✅ Todos os 8 usuários candidatos teste foram criados com sucesso!')
    console.log('Senha padrão para todos: 123456')
    
  } catch (error) {
    console.error('Erro ao criar usuários teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()