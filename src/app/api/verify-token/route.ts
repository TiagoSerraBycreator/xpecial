import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verificando token...')

    // Tentar obter token do cookie ou header
    const cookieToken = request.cookies.get('auth-token')?.value
    const headerToken = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    const token = cookieToken || headerToken

    if (!token) {
      console.log('❌ Token não encontrado')
      return NextResponse.json(
        { success: false, error: 'Token não encontrado' },
        { status: 401 }
      )
    }

    console.log('🎫 Token encontrado')

    // Verificar token
    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as any

    console.log('✅ Token válido para usuário:', decoded.email)

    // Buscar dados atualizados do usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        candidateId: true,
        companyId: true,
        isActive: true,
        isEmailVerified: true
      }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado no banco')
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      console.log('❌ Usuário inativo')
      return NextResponse.json(
        { success: false, error: 'Conta inativa' },
        { status: 403 }
      )
    }

    console.log('✅ Usuário verificado com sucesso')

    return NextResponse.json({
      success: true,
      user,
      tokenValid: true
    })

  } catch (error) {
    console.error('💥 Erro na verificação do token:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token é obrigatório' },
        { status: 400 }
      )
    }

    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
    const decoded = jwt.verify(token, secret) as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        candidateId: true,
        companyId: true,
        isActive: true,
        isEmailVerified: true
      }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Usuário inválido ou inativo' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
      tokenValid: true
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Token inválido' },
      { status: 401 }
    )
  }
}