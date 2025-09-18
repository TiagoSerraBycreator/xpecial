import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkEmailSchema = z.object({
  email: z.string().email('Email inválido')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = checkEmailSchema.parse(body)

    // Verificar se o email já existe na tabela de usuários
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe na tabela de empresas
    const existingCompany = await prisma.company.findUnique({
      where: { email: validatedData.email }
    })

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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao verificar email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}