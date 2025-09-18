import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkEmailSchema = z.object({
  email: z.string().email('Email inválido')
})

export async function POST(request: NextRequest) {
  try {
    // Verificar se o corpo da requisição existe
    let body;
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError)
      return NextResponse.json(
        { error: 'Formato de dados inválido' },
        { status: 400 }
      )
    }

    // Validar dados de entrada
    let validatedData;
    try {
      validatedData = checkEmailSchema.parse(body)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: validationError.issues[0].message },
          { status: 400 }
        )
      }
      throw validationError;
    }

    // Verificar conexão com o banco de dados
    try {
      await prisma.$connect()
    } catch (dbConnectionError) {
      console.error('Erro de conexão com o banco de dados:', dbConnectionError)
      return NextResponse.json(
        { error: 'Erro de conexão com o banco de dados' },
        { status: 500 }
      )
    }

    // Verificar se o email já existe na tabela de usuários
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })
    } catch (userQueryError) {
      console.error('Erro ao consultar tabela de usuários:', userQueryError)
      return NextResponse.json(
        { error: 'Erro ao verificar usuário existente' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe na tabela de empresas
    let existingCompany;
    try {
      existingCompany = await prisma.company.findUnique({
        where: { email: validatedData.email }
      })
    } catch (companyQueryError) {
      console.error('Erro ao consultar tabela de empresas:', companyQueryError)
      return NextResponse.json(
        { error: 'Erro ao verificar empresa existente' },
        { status: 500 }
      )
    }

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Email disponível' },
      { status: 200 }
    )
  } catch (error) {
    // Log detalhado do erro
    console.error('Erro inesperado na API check-email:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method
    })

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    // Garantir que a conexão seja fechada
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('Erro ao desconectar do banco:', disconnectError)
    }
  }
}