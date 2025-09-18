import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    let candidate = await prisma.candidate.findUnique({
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

    // Se o candidato não existir, criar um novo registro
    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          userId: session.user.id,
          isActive: true
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
    }

    return NextResponse.json({
      id: candidate.id,
      fullName: candidate.user.name,
      email: candidate.user.email,
      phone: candidate.phone,
      city: candidate.city,
      state: candidate.state,
      dateOfBirth: candidate.dateOfBirth?.toISOString(),
      bio: candidate.description,
      skills: candidate.skills ? candidate.skills.split(', ').filter(skill => skill.trim()) : [],
      languages: candidate.languages ? candidate.languages.split(', ').filter(lang => lang.trim()) : [],
      experience: candidate.experience,
      education: candidate.education,
      profileVideoUrl: candidate.profileVideoUrl,
      availability: candidate.availability,
      profilePhoto: candidate.profilePhoto,
      videoResumeUrl: candidate.videoResumeUrl,
      aboutMe: candidate.aboutMe,
      isActive: candidate.isActive
    })
  } catch (error) {
    console.error('Erro ao buscar perfil do candidato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('=== INÍCIO PUT /api/candidate/profile ===')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', { 
      userId: session?.user?.id, 
      email: session?.user?.email, 
      role: session?.user?.role 
    })
    
    if (!session?.user?.email) {
      console.log('❌ Erro: Sessão não encontrada')
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    // Verificar se é candidato (aceitar tanto CANDIDATE quanto candidate)
    const userRole = session.user.role?.toUpperCase()
    console.log('User role:', userRole)
    
    if (userRole !== 'CANDIDATE') {
      console.log('❌ Erro: Acesso negado - role não é CANDIDATE')
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('Body recebido:', JSON.stringify(body, null, 2))
    
    // Extrair dados do body - aceitar tanto estrutura direta quanto com objeto profile
    const profileData = body.profile || body
    console.log('Profile data extraído:', JSON.stringify(profileData, null, 2))
    
    const {
      fullName,
      phone,
      city,
      state,
      dateOfBirth,
      bio,
      skills,
      languages,
      experience,
      education,
      profileVideoUrl
    } = profileData
    
    console.log('Campos extraídos:', {
      fullName,
      phone,
      city,
      state,
      dateOfBirth,
      bio,
      skills,
      languages,
      experience,
      education,
      profileVideoUrl
    })
    
    // Validar campos obrigatórios
    if (!fullName) {
      console.log('❌ Erro: Nome completo é obrigatório')
      return NextResponse.json(
        { error: 'Nome completo é obrigatório' },
        { status: 400 }
      )
    }

    console.log('🔍 Buscando candidato para userId:', session.user.id)
    let existingCandidate = await prisma.candidate.findUnique({
      where: {
        userId: session.user.id
      }
    })
    console.log('Candidato encontrado:', existingCandidate ? 'Sim' : 'Não')

    // Se o candidato não existir, criar um novo registro
    if (!existingCandidate) {
      console.log('📝 Criando novo candidato...')
      existingCandidate = await prisma.candidate.create({
        data: {
          userId: session.user.id,
          isActive: true,
          description: bio || null,
          skills: Array.isArray(skills) ? skills.join(', ') : (skills || null),
          languages: Array.isArray(languages) ? languages.join(', ') : (languages || null),
          experience: experience || null,
          education: education || null,
          profileVideoUrl: profileVideoUrl || null,
          ...(phone && { phone }),
          ...(city && { city }),
          ...(state && { state }),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) })
        }
      })
      console.log('✅ Candidato criado:', existingCandidate.id)
    }

    if (fullName) {
      console.log('📝 Atualizando nome do usuário...')
      await prisma.user.update({
        where: {
          id: session.user.id
        },
        data: {
          name: fullName.trim()
        }
      })
      console.log('✅ Nome do usuário atualizado')
    }

    // Atualizar dados do candidato
    console.log('📝 Atualizando dados do candidato...')
    const candidateUpdateData: any = {}
    
    if (bio) candidateUpdateData.description = bio
    if (skills) {
      candidateUpdateData.skills = Array.isArray(skills) ? skills.join(', ') : skills
    }
    if (languages) {
      candidateUpdateData.languages = Array.isArray(languages) ? languages.join(', ') : languages
    }
    if (experience) candidateUpdateData.experience = experience
    if (education) candidateUpdateData.education = education
    if (profileVideoUrl) candidateUpdateData.profileVideoUrl = profileVideoUrl
    if (phone) candidateUpdateData.phone = phone
    if (city) candidateUpdateData.city = city
    if (state) candidateUpdateData.state = state
    if (dateOfBirth) {
      try {
        candidateUpdateData.dateOfBirth = new Date(dateOfBirth)
      } catch (error) {
        console.log('❌ Erro: Data de nascimento inválida')
        return NextResponse.json(
          { error: 'Data de nascimento inválida' },
          { status: 400 }
        )
      }
    }
    
    console.log('Dados para atualizar candidato:', candidateUpdateData)
    
    const updatedCandidate = await prisma.candidate.update({
      where: { id: existingCandidate.id },
      data: candidateUpdateData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    console.log('✅ Candidato atualizado')

    const response = {
      id: updatedCandidate.id,
      fullName: updatedCandidate.user.name,
      email: updatedCandidate.user.email,
      phone: updatedCandidate.phone,
      city: updatedCandidate.city,
      state: updatedCandidate.state,
      dateOfBirth: updatedCandidate.dateOfBirth?.toISOString(),
      bio: updatedCandidate.description,
      skills: updatedCandidate.skills ? updatedCandidate.skills.split(', ').filter(skill => skill.trim()) : [],
      languages: updatedCandidate.languages ? updatedCandidate.languages.split(', ').filter(lang => lang.trim()) : [],
      experience: updatedCandidate.experience,
      education: updatedCandidate.education,
      profileVideoUrl: updatedCandidate.profileVideoUrl
    }
    
    console.log('✅ Resposta final:', JSON.stringify(response, null, 2))
    console.log('=== FIM PUT /api/candidate/profile ===')
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ ERRO ao atualizar perfil:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    console.log('=== FIM PUT /api/candidate/profile (COM ERRO) ===')
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}