import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/utils'
import { sendEmailVerification, generateVerificationToken, getVerificationTokenExpiry } from '@/lib/email'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['CANDIDATE', 'COMPANY']),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  companyName: z.string().optional(),
  sector: z.string().optional(),
  website: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Generate email verification token
    const verificationToken = generateVerificationToken()
    const verificationExpiry = getVerificationTokenExpiry()

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        isActive: false,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry
      }
    })

    // Create candidate or company profile
    if (validatedData.role === 'CANDIDATE') {
      await prisma.candidate.create({
        data: {
          userId: user.id,
          phone: validatedData.phone,
          city: validatedData.city,
          state: validatedData.state
        }
      })
    } else if (validatedData.role === 'COMPANY') {
      const companyName = validatedData.companyName || validatedData.name;
      const slug = companyName.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      await prisma.company.create({
        data: {
          userId: user.id,
          name: companyName,
          email: validatedData.email,
          slug: slug,
          sector: validatedData.sector,
          website: validatedData.website
        }
      })
    }

    // Send email verification
    try {
      await sendEmailVerification(user.email, user.name, verificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Continue with successful registration even if email fails
    }

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso! Verifique seu email para ativar sua conta.',
        requiresVerification: true
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}