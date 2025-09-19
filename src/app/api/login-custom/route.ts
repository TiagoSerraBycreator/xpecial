import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Login Customizada - Iniciando...')
    
    const body = await request.json()
    const { email, password } = body

    console.log('📧 Email recebido:', email)
    console.log('🔑 Password recebido:', !!password)

    if (!email || !password) {
      console.log('❌ Credenciais ausentes')
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário no banco
    console.log('🔍 Buscando usuário no banco...')
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado')
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    console.log('✅ Usuário encontrado:', { id: user.id, email: user.email, role: user.role })

    // Verificar senha
    console.log('🔐 Verificando senha...')
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      console.log('❌ Senha inválida')
      return NextResponse.json(
        { success: false, error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    console.log('✅ Senha válida')

    // Verificar se usuário está ativo
    if (!user.isActive) {
      console.log('❌ Usuário inativo')
      return NextResponse.json(
        { success: false, error: 'Conta inativa. Entre em contato com o administrador.' },
        { status: 403 }
      )
    }

    console.log('✅ Usuário ativo')

    // Criar JWT token
    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        candidateId: user.candidateId,
        companyId: user.companyId
      },
      secret,
      { expiresIn: '7d' }
    )

    console.log('🎫 Token JWT criado')

    // Preparar dados do usuário (sem senha)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      candidateId: user.candidateId,
      companyId: user.companyId,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified
    }

    console.log('✅ Login realizado com sucesso')

    // Criar resposta com cookie seguro
    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userData,
      token
    })

    // Configurar cookie seguro
    const cookieOptions = [
      `auth-token=${token}`,
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Path=/',
      'Max-Age=604800' // 7 dias
    ]

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.push('Domain=.vercel.app')
    }

    response.headers.set('Set-Cookie', cookieOptions.join('; '))

    console.log('🍪 Cookie configurado')

    return response

  } catch (error) {
    console.error('💥 Erro no login customizado:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Método GET para verificar se a API está funcionando
export async function GET() {
  return NextResponse.json({
    message: 'API de Login Customizada funcionando',
    timestamp: new Date().toISOString()
  })
}