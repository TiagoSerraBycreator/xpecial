import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO POST /api/candidate/avatar ===')
    
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
    
    // Verificar se é candidato
    const userRole = session.user.role?.toUpperCase()
    console.log('User role:', userRole)
    
    if (userRole !== 'CANDIDATE') {
      console.log('❌ Erro: Acesso negado - role não é CANDIDATE')
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File
    
    if (!file) {
      console.log('❌ Erro: Nenhum arquivo enviado')
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    console.log('Arquivo recebido:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Erro: Tipo de arquivo não permitido')
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.log('❌ Erro: Arquivo muito grande')
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB.' },
        { status: 400 }
      )
    }

    // Criar diretório de uploads se não existir
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!existsSync(uploadsDir)) {
      console.log('📁 Criando diretório de uploads...')
      await mkdir(uploadsDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${session.user.id}_${timestamp}.${extension}`
    const filePath = join(uploadsDir, fileName)
    
    console.log('Salvando arquivo em:', filePath)

    // Salvar arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    console.log('✅ Arquivo salvo com sucesso')

    // URL pública do arquivo
    const avatarUrl = `/uploads/avatars/${fileName}`
    
    // Buscar ou criar candidato
    console.log('🔍 Buscando candidato para userId:', session.user.id)
    let candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id }
    })

    if (!candidate) {
      console.log('📝 Criando novo candidato...')
      candidate = await prisma.candidate.create({
        data: {
          userId: session.user.id,
          profilePhoto: avatarUrl
        }
      })
      console.log('✅ Candidato criado com avatar')
    } else {
      console.log('📝 Atualizando avatar do candidato...')
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: { profilePhoto: avatarUrl }
      })
      console.log('✅ Avatar atualizado')
    }

    const response = {
      success: true,
      avatarUrl,
      message: 'Avatar atualizado com sucesso'
    }
    
    console.log('✅ Resposta final:', response)
    console.log('=== FIM POST /api/candidate/avatar ===')
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ ERRO ao fazer upload do avatar:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    console.log('=== FIM POST /api/candidate/avatar (COM ERRO) ===')
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}