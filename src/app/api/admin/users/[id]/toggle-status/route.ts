import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { isActive } = await request.json()
    const resolvedParams = await params
    const userId = resolvedParams.id

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Não permitir desabilitar administradores
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Não é possível desabilitar administradores' }, { status: 400 })
    }

    // Atualizar o status do usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: `Usuário ${isActive ? 'habilitado' : 'desabilitado'} com sucesso`,
      user: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}