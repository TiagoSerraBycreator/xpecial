import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const configSchema = z.object({
  // Configurações de segurança
  maxLoginAttempts: z.number().min(1).max(10).optional(),
  lockoutDuration: z.number().min(1).max(120).optional(),
  
  // Configurações de email
  smtpHost: z.string().optional(),
  smtpPort: z.number().min(1).max(65535).optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  fromEmail: z.string().email().optional(),
  fromName: z.string().optional(),
  enableSSL: z.boolean().optional(),
  
  // Configurações de notificações
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  weeklyReports: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
  marketingEmails: z.boolean().optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar todas as configurações
    const configs = await prisma.systemConfig.findMany()
    
    // Converter para objeto
    const configObject: any = {}
    configs.forEach(config => {
      // Converter valores booleanos e numéricos
      let value: any = config.value
      if (value === 'true') value = true
      else if (value === 'false') value = false
      else if (!isNaN(Number(value))) value = Number(value)
      
      configObject[config.key] = value
    })

    return NextResponse.json(configObject)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = configSchema.parse(body)

    // Salvar cada configuração no banco
    const promises = Object.entries(validatedData).map(async ([key, value]) => {
      if (value !== undefined) {
        // Determinar categoria baseada na chave
        let category = 'general'
        if (key.startsWith('smtp') || key.includes('Email') || key.includes('SSL')) {
          category = 'email'
        } else if (key.includes('Notifications') || key.includes('Reports') || key.includes('Alerts')) {
          category = 'notifications'
        } else if (key.includes('Login') || key.includes('lockout')) {
          category = 'security'
        }

        return prisma.systemConfig.upsert({
          where: { key },
          update: { 
            value: String(value),
            category,
            updatedAt: new Date()
          },
          create: { 
            key, 
            value: String(value),
            category
          }
        })
      }
    })

    await Promise.all(promises.filter(Boolean))

    return NextResponse.json({ 
      success: true, 
      message: 'Configurações salvas com sucesso!' 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao salvar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}