import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const accountActivitySchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete']),
  confirmPassword: z.string().min(1, 'Senha de confirmação é obrigatória')
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, confirmPassword } = accountActivitySchema.parse(body)

    // Buscar usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar senha de confirmação
    const bcrypt = require('bcryptjs')
    const isPasswordValid = await bcrypt.compare(confirmPassword, currentUser.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'activate':
        await prisma.user.update({
          where: { id: session.user.id },
          data: { isActive: true }
        })
        return NextResponse.json({
          message: 'Conta ativada com sucesso'
        })

      case 'deactivate':
        await prisma.user.update({
          where: { id: session.user.id },
          data: { isActive: false }
        })
        return NextResponse.json({
          message: 'Conta desativada com sucesso'
        })

      case 'delete':
        // Soft delete - marcar como inativo e limpar dados sensíveis
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            isActive: false,
            email: `deleted_${Date.now()}@deleted.com`,
            name: 'Usuário Deletado',
            password: 'deleted'
          }
        })
        return NextResponse.json({
          message: 'Conta deletada com sucesso'
        })

      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Erro na atividade da conta:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}