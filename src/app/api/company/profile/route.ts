import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const company = await prisma.company.findUnique({
      where: {
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Erro ao buscar perfil da empresa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('=== SALVANDO PERFIL ===');
    console.log('Dados recebidos:', JSON.stringify(body, null, 2));
    
    const {
      name,
      email,
      logo,
      description,
      website,
      sector,
      phone,
      address,
      city,
      state,
      foundedYear,
      employeeCount,
      mission,
      vision,
      values,
      slug
    } = body

    // Validação básica
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nome da empresa é obrigatório' },
        { status: 400 }
      )
    }

    // Validar email se fornecido
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Verificar se a empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o email já está em uso por outra empresa
    if (email && email !== existingCompany.email) {
      const emailInUse = await prisma.company.findUnique({
        where: { email: email }
      })

      if (emailInUse) {
        return NextResponse.json(
          { error: 'Este email já está em uso por outra empresa' },
          { status: 400 }
        )
      }

      // Verificar se o email já está em uso por um usuário
      const userWithEmail = await prisma.user.findUnique({
        where: { email: email }
      })

      if (userWithEmail) {
        return NextResponse.json(
          { error: 'Este email já está em uso' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização (apenas campos fornecidos)
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name.trim()
    if (email !== undefined) updateData.email = email?.trim() || null
    if (logo !== undefined) updateData.logo = logo?.trim() || null
    if (description !== undefined) updateData.description = description?.trim() || null
    if (website !== undefined) updateData.website = website?.trim() || null
    if (sector !== undefined) updateData.sector = sector?.trim() || null
    if (phone !== undefined) updateData.phone = phone?.trim() || null
    if (address !== undefined) updateData.address = address?.trim() || null
    if (city !== undefined) updateData.city = city?.trim() || null
    if (state !== undefined) updateData.state = state?.trim() || null
    if (foundedYear !== undefined) updateData.foundedYear = foundedYear?.trim() || null
    if (employeeCount !== undefined) updateData.employeeCount = employeeCount?.trim() || null
    if (mission !== undefined) updateData.mission = mission?.trim() || null
    if (vision !== undefined) updateData.vision = vision?.trim() || null
    if (values !== undefined) updateData.values = values ? JSON.stringify(values) : null
    if (slug !== undefined) updateData.slug = slug?.trim() || null

    // Atualizar empresa
    const updatedCompany = await prisma.company.update({
      where: {
        userId: session.user.id
      },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedCompany)
  } catch (error) {
    console.error('Erro ao atualizar perfil da empresa:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack)
      console.error('Error message:', error.message)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: errorMessage },
      { status: 500 }
    )
  }
}