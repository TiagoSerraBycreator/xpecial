import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const certificateId = id

    // Buscar candidato do usuário
    const candidate = await prisma.candidate.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      )
    }

    // Buscar certificado
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: certificateId,
        candidateId: candidate.id
      },
      include: {
        course: {
          select: {
            title: true,
            duration: true
          }
        },
        candidate: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificado não encontrado' },
        { status: 404 }
      )
    }

    // Gerar PDF do certificado
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    })

    // Buffer para armazenar o PDF
    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))
    
    return new Promise<NextResponse>((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks)
        
        const response = new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="certificado-${certificate.id}.pdf"`,
            'Content-Length': pdfBuffer.length.toString()
          }
        })
        
        resolve(response)
      })

      // Configurar fonte e cores
      doc.fontSize(24)
      doc.fillColor('#1f2937')

      // Título principal
      doc.text('CERTIFICADO DE CONCLUSÃO', 0, 100, {
        align: 'center',
        width: doc.page.width
      })

      // Linha decorativa
      doc.moveTo(150, 150)
         .lineTo(doc.page.width - 150, 150)
         .strokeColor('#3b82f6')
         .lineWidth(3)
         .stroke()

      // Texto principal
      doc.fontSize(16)
      doc.fillColor('#374151')
      doc.text('Certificamos que', 0, 200, {
        align: 'center',
        width: doc.page.width
      })

      // Nome do candidato
      doc.fontSize(28)
      doc.fillColor('#1f2937')
      doc.font('Helvetica-Bold')
      doc.text(certificate.candidate.user.name, 0, 240, {
        align: 'center',
        width: doc.page.width
      })

      // Texto do curso
      doc.fontSize(16)
      doc.fillColor('#374151')
      doc.font('Helvetica')
      doc.text('concluiu com êxito o curso', 0, 290, {
        align: 'center',
        width: doc.page.width
      })

      // Nome do curso
      doc.fontSize(22)
      doc.fillColor('#1f2937')
      doc.font('Helvetica-Bold')
      doc.text(certificate.course.title, 0, 330, {
        align: 'center',
        width: doc.page.width
      })

      // Informações do curso
      doc.fontSize(14)
      doc.fillColor('#6b7280')
      doc.font('Helvetica')
      doc.text(`Duração: ${certificate.course.duration}h`, 0, 380, {
        align: 'center',
        width: doc.page.width
      })

      // Data de emissão
      doc.text(`Emitido em: ${certificate.issuedAt.toLocaleDateString('pt-BR')}`, 0, 410, {
        align: 'center',
        width: doc.page.width
      })

      // ID do certificado
      doc.fontSize(10)
      doc.text(`ID do Certificado: ${certificate.id}`, 0, 450, {
        align: 'center',
        width: doc.page.width
      })

      // Assinatura digital
      doc.fontSize(12)
      doc.fillColor('#3b82f6')
      doc.text('Xpecial - Plataforma de Recrutamento e Capacitação', 0, 480, {
        align: 'center',
        width: doc.page.width
      })

      // Linha decorativa inferior
      doc.moveTo(150, 520)
         .lineTo(doc.page.width - 150, 520)
         .strokeColor('#3b82f6')
         .lineWidth(2)
         .stroke()

      // Finalizar o documento
      doc.end()
    })
  } catch (error) {
    console.error('Erro ao gerar certificado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}