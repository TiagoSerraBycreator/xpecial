import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Logout customizado - Iniciando...')

    // Criar resposta de sucesso
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    })

    // Limpar cookie de autenticação
    const cookieOptions = [
      'auth-token=',
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Path=/',
      'Max-Age=0', // Expira imediatamente
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    ]

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.push('Domain=.vercel.app')
    }

    response.headers.set('Set-Cookie', cookieOptions.join('; '))

    console.log('✅ Logout realizado com sucesso')

    return response

  } catch (error) {
    console.error('💥 Erro no logout:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Logout Customizada funcionando',
    timestamp: new Date().toISOString()
  })
}