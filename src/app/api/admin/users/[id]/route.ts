import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id: id },
      include: {
        candidate: {
          include: {
            applications: {
              include: {
                job: {
                  select: {
                    title: true,
                    company: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
            certificates: true
          }
        },
        company: {
          include: {
            jobs: {
              include: {
                applications: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const formattedUser = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, role, isActive, isEmailVerified, password } = body

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o email já está em uso por outro usuário
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Este email já está em uso por outro usuário' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      name,
      email,
      role,
      isActive,
      isEmailVerified
    }

    // Se uma nova senha foi fornecida, criptografá-la
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 12)
      updateData.password = hashedPassword
    }

    // Se o email foi alterado e não está verificado, limpar tokens
    if (email !== existingUser.email && !isEmailVerified) {
      updateData.emailVerificationToken = null
      updateData.emailVerificationExpiry = null
    }

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: { role: true, email: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Prevent deletion of admin users
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Não é possível excluir usuários administradores' },
        { status: 400 }
      )
    }

    // Prevent deletion of the main admin (first admin created - ID 1)
    if (id === '1') {
      return NextResponse.json(
        { error: 'Não é possível excluir o administrador geral do sistema' },
        { status: 400 }
      )
    }

    // Delete user and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete related data first
      if (user.role === 'CANDIDATE') {
        // Delete applications
        await tx.application.deleteMany({
          where: {
            candidate: {
              userId: id
            }
          }
        })

        // Delete certificates
        await tx.certificate.deleteMany({
          where: {
            candidate: {
              userId: id
            }
          }
        })

        // Delete candidate profile
        await tx.candidate.deleteMany({
          where: { userId: id }
        })
      } else if (user.role === 'COMPANY') {
        // Delete applications for company jobs
        await tx.application.deleteMany({
          where: {
            job: {
              company: {
                userId: id
              }
            }
          }
        })

        // Delete jobs
        await tx.job.deleteMany({
          where: {
            company: {
              userId: id
            }
          }
        })

        // Delete company profile
        await tx.company.deleteMany({
          where: { userId: id }
        })
      }

      // Finally delete the user
      await tx.user.delete({
        where: { id: id }
      })
    })

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}