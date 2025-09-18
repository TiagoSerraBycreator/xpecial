import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTemporaryPasswordEmail } from '@/lib/email'
import { generateTemporaryPassword, hashPassword } from '@/lib/utils'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.' },
        { status: 200 }
      )
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword()
    const hashedTemporaryPassword = await hashPassword(temporaryPassword)
    const temporaryPasswordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    // Update user with temporary password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedTemporaryPassword,
        resetToken: temporaryPassword, // Store plain temporary password for reference
        resetTokenExpiry: temporaryPasswordExpiry
      }
    })

    // Send temporary password email
    try {
      await sendTemporaryPasswordEmail(user.email, user.name, temporaryPassword)
    } catch (emailError) {
      console.error('Failed to send temporary password email:', emailError)
      return NextResponse.json(
        { error: 'Erro ao enviar email com senha temporária. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Se o email existir em nossa base, você receberá uma senha temporária e instruções para acessar sua conta.' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}