import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { 
          error: 'Token de verificação é obrigatório',
          status: 'invalid_token',
          details: 'Nenhum token foi fornecido na URL'
        },
        { status: 400 }
      )
    }

    // First, try to find user with this token (even if expired)
    const userWithToken = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token
      }
    })

    // If no user found with this token at all
    if (!userWithToken) {
      return NextResponse.json(
        { 
          error: 'Token inválido',
          status: 'invalid_token',
          details: 'Este token de verificação não existe ou já foi usado'
        },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (userWithToken.emailVerificationExpiry && userWithToken.emailVerificationExpiry <= new Date()) {
      return NextResponse.json(
        { 
          error: 'Token expirado',
          status: 'expired_token',
          details: 'Este token de verificação expirou. Solicite um novo email de verificação.',
          userEmail: userWithToken.email
        },
        { status: 400 }
      )
    }

    // Check if email is already verified
    if (userWithToken.isEmailVerified) {
      return NextResponse.json(
        { 
          message: 'Email já foi verificado anteriormente',
          status: 'already_verified',
          details: 'Sua conta já está ativa. Você pode fazer login normalmente.',
          isActive: userWithToken.isActive
        },
        { status: 200 }
      )
    }

    // Update user to mark email as verified and activate account
    const updatedUser = await prisma.user.update({
      where: { id: userWithToken.id },
      data: {
        isEmailVerified: true,
        isActive: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null
      }
    })

    // Verify the update was successful by checking the database
    const verifiedUser = await prisma.user.findUnique({
      where: { id: updatedUser.id },
      select: {
        isEmailVerified: true,
        isActive: true,
        email: true,
        name: true
      }
    })

    if (!verifiedUser?.isEmailVerified || !verifiedUser?.isActive) {
      return NextResponse.json(
        { 
          error: 'Erro na ativação da conta',
          status: 'activation_failed',
          details: 'Houve um problema ao ativar sua conta. Entre em contato com o administrador.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Conta ativada com sucesso!',
        status: 'success',
        details: 'Sua conta foi ativada e você já pode fazer login.',
        verified: true,
        userInfo: {
          email: verifiedUser.email,
          name: verifiedUser.name
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        status: 'server_error',
        details: 'Ocorreu um erro inesperado. Tente novamente ou entre em contato com o administrador.'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: 'Email já foi verificado' },
        { status: 200 }
      )
    }

    // Generate new verification token
    const { generateVerificationToken, getVerificationTokenExpiry, sendEmailVerification } = await import('@/lib/email')
    
    const verificationToken = generateVerificationToken()
    const verificationExpiry = getVerificationTokenExpiry()

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry
      }
    })

    // Send new verification email
    try {
      await sendEmailVerification(user.email, user.name, verificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        { error: 'Erro ao enviar email de verificação' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Novo email de verificação enviado com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}