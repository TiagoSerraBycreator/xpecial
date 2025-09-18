import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const testEmailSchema = z.object({
  to: z.string().email('Email inválido'),
  subject: z.string().min(1, 'Assunto é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  smtpConfig: z.object({
    smtpHost: z.string().optional(),
    smtpPort: z.number().optional(),
    smtpUser: z.string().optional(),
    smtpPassword: z.string().optional(),
    fromEmail: z.string().optional(),
    fromName: z.string().optional(),
    enableSSL: z.boolean().optional()
  }).optional()
})

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
    const validatedData = testEmailSchema.parse(body)

    const { to, subject, message, smtpConfig } = validatedData

    // Usar configurações fornecidas ou fallback para variáveis de ambiente
    // Tratar strings vazias como undefined para fazer fallback correto
    const config = {
      smtpHost: (smtpConfig?.smtpHost && smtpConfig.smtpHost.trim()) || process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: smtpConfig?.smtpPort || parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: (smtpConfig?.smtpUser && smtpConfig.smtpUser.trim()) || process.env.SMTP_USER || '',
      smtpPassword: (smtpConfig?.smtpPassword && smtpConfig.smtpPassword.trim()) || process.env.SMTP_PASSWORD || '',
      fromEmail: (smtpConfig?.fromEmail && smtpConfig.fromEmail.trim()) || process.env.SMTP_FROM || process.env.SMTP_USER || '',
      fromName: (smtpConfig?.fromName && smtpConfig.fromName.trim()) || 'Xpecial',
      enableSSL: smtpConfig?.enableSSL ?? (parseInt(process.env.SMTP_PORT || '587') === 465)
    }

    // Validar se temos as configurações mínimas necessárias
    if (!config.smtpHost || !config.smtpUser || !config.smtpPassword || !config.fromEmail) {
      return NextResponse.json(
        { error: 'Configurações SMTP incompletas. Verifique as configurações de email.' },
        { status: 400 }
      )
    }

    // Configurar transporter do nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Usar serviço Gmail específico
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false, // true para 465, false para 587
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false // Para desenvolvimento
      }
    })

    // Verificar conexão SMTP
    try {
      await transporter.verify()
    } catch (verifyError) {
      console.error('Erro na verificação SMTP:', verifyError)
      return NextResponse.json(
        { error: 'Falha na conexão SMTP. Verifique as configurações.' },
        { status: 400 }
      )
    }

    // Preparar o email
    const mailOptions = {
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin: 0;">🧪 Teste de Configuração SMTP</h2>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Xpecial - Plataforma de Recrutamento</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Mensagem de Teste</h3>
            <p style="color: #4b5563; line-height: 1.6;">${message}</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}
              </p>
              <p style="color: #9ca3af; font-size: 14px; margin: 5px 0 0 0;">
                <strong>Servidor SMTP:</strong> ${config.smtpHost}:${config.smtpPort}
              </p>
              <p style="color: #9ca3af; font-size: 14px; margin: 5px 0 0 0;">
                <strong>SSL/TLS:</strong> ${config.enableSSL ? 'Habilitado' : 'Desabilitado'}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #9ca3af; font-size: 12px;">
              Este é um email de teste automático gerado pelo painel administrativo do Xpecial.
            </p>
          </div>
        </div>
      `,
      text: `
        🧪 Teste de Configuração SMTP - Xpecial
        
        ${message}
        
        ---
        Data/Hora: ${new Date().toLocaleString('pt-BR')}
        Servidor SMTP: ${config.smtpHost}:${config.smtpPort}
        SSL/TLS: ${config.enableSSL ? 'Habilitado' : 'Desabilitado'}
        
        Este é um email de teste automático gerado pelo painel administrativo do Xpecial.
      `
    }

    // Enviar o email
    try {
      const info = await transporter.sendMail(mailOptions)
      
      return NextResponse.json({
        success: true,
        message: 'Email de teste enviado com sucesso!',
        messageId: info.messageId,
        details: {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          timestamp: new Date().toISOString()
        }
      })
    } catch (sendError: any) {
      console.error('Erro ao enviar email:', sendError)
      
      let errorMessage = 'Falha ao enviar email. Verifique as configurações SMTP.'
      
      // Mensagens de erro mais específicas baseadas no tipo de erro
      if (sendError.code === 'EAUTH') {
        errorMessage = 'Erro de autenticação SMTP. Verifique o usuário e senha.'
      } else if (sendError.code === 'ECONNECTION') {
        errorMessage = 'Erro de conexão SMTP. Verifique o servidor e porta.'
      } else if (sendError.code === 'ETIMEDOUT') {
        errorMessage = 'Timeout na conexão SMTP. Verifique a conectividade de rede.'
      } else if (sendError.message?.includes('Invalid login')) {
        errorMessage = 'Credenciais SMTP inválidas. Verifique usuário e senha.'
      } else if (sendError.message?.includes('self signed certificate')) {
        errorMessage = 'Problema com certificado SSL. Tente desabilitar SSL ou use TLS.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: sendError.message,
          code: sendError.code
        },
        { status: 400 }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro no teste SMTP:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}