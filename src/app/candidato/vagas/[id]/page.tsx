'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import CandidateLayout from '@/components/layout/CandidateLayout'
import ApplicationModal from '@/components/ui/ApplicationModal'
import { ArrowLeft, MapPin, Building, Calendar, DollarSign, Send, Clock, Users } from 'lucide-react'

interface Job {
  id: string
  title: string
  description: string
  requirements: string
  city?: string
  state?: string
  salaryMin: number | null
  salaryMax: number | null
  workMode: string
  status: string
  createdAt: string
  recruitmentVideoUrl?: string
  company: {
    name: string
    description?: string
  }
  _count: {
    applications: number
  }
}

export default function JobPreview() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  // Função para extrair ID do vídeo do YouTube
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  useEffect(() => {
    if (session && params.id) {
      fetchJob()
      checkIfApplied()
    }
  }, [session, params.id])

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/candidate/jobs/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setJob(data)
      } else {
        router.push('/candidato/vagas')
      }
    } catch (error) {
      console.error('Erro ao carregar vaga:', error)
      router.push('/candidato/vagas')
    } finally {
      setLoading(false)
    }
  }

  const checkIfApplied = async () => {
    try {
      const response = await fetch(`/api/candidate/applications/check/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setHasApplied(data.hasApplied)
      }
    } catch (error) {
      console.error('Erro ao verificar candidatura:', error)
    }
  }

  const handleApply = async (data: { whatsapp: string; consent: boolean }) => {
    setApplying(true)
    try {
      const response = await fetch('/api/candidate/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          jobId: params.id,
          whatsapp: data.whatsapp,
          consent: data.consent
        })
      })

      if (response.ok) {
        setHasApplied(true)
        alert('Candidatura enviada com sucesso!')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao enviar candidatura')
      }
    } catch (error) {
      console.error('Erro ao enviar candidatura:', error)
      alert('Erro ao enviar candidatura')
    } finally {
      setApplying(false)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando vaga...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Vaga não encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <CandidateLayout>
      <div className="p-6">
        {/* Header com botão voltar */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar às vagas</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header da vaga */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{job.company.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {job.city && job.state ? `${job.city}, ${job.state}` : 
                         job.city ? job.city : 
                         job.state ? job.state : 'Remoto'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(job.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {job.workMode === 'REMOTE' ? 'Remoto' :
                       job.workMode === 'HYBRID' ? 'Híbrido' :
                       job.workMode === 'ON_SITE' ? 'Presencial' : job.workMode}
                    </span>
                    {(job.salaryMin || job.salaryMax) && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">
                          {job.salaryMin && job.salaryMax 
                            ? `R$ ${job.salaryMin.toLocaleString('pt-BR')} - R$ ${job.salaryMax.toLocaleString('pt-BR')}`
                            : job.salaryMin 
                            ? `A partir de R$ ${job.salaryMin.toLocaleString('pt-BR')}`
                            : `Até R$ ${job.salaryMax?.toLocaleString('pt-BR')}`
                          }
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{job._count.applications} candidatura(s)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de candidatura */}
              <div className="flex justify-end">
                {hasApplied ? (
                  <div className="flex items-center space-x-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg">
                    <Clock className="h-4 w-4" />
                    <span>Candidatura enviada</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApplicationModal(true)}
                    disabled={applying}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>Candidatar-se</span>
                  </button>
                )}
              </div>
            </div>

            {/* Conteúdo da vaga */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna principal */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Descrição */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Descrição da Vaga</h2>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                    </div>
                  </div>

                  {/* Vídeo de Recrutamento */}
                  {job.recruitmentVideoUrl && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Vídeo de Recrutamento</h2>
                      <div className="bg-gray-100 rounded-lg p-4">
                        {getYouTubeVideoId(job.recruitmentVideoUrl) ? (
                          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                              className="absolute top-0 left-0 w-full h-full rounded-lg"
                              src={`https://www.youtube.com/embed/${getYouTubeVideoId(job.recruitmentVideoUrl)}`}
                              title="Vídeo de Recrutamento"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-600">URL do vídeo inválida</p>
                            <a 
                              href={job.recruitmentVideoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Assistir no YouTube
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Requisitos */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Requisitos</h2>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Informações da Empresa</h3>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{job.company.name}</h4>
                      {job.company.description && (
                        <p className="text-sm text-gray-600">{job.company.description}</p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Detalhes da Vaga</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Modo de Trabalho:</span>
                          <span className="text-gray-900">
                            {job.workMode === 'REMOTE' ? 'Remoto' :
                             job.workMode === 'HYBRID' ? 'Híbrido' :
                             job.workMode === 'ON_SITE' ? 'Presencial' : job.workMode}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Localização:</span>
                          <span className="text-gray-900">
                            {job.city && job.state ? `${job.city}, ${job.state}` : 
                             job.city ? job.city : 
                             job.state ? job.state : 'Remoto'}
                          </span>
                        </div>
                        {(job.salaryMin || job.salaryMax) && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Salário:</span>
                            <span className="text-gray-900">
                              {job.salaryMin && job.salaryMax 
                                ? `R$ ${job.salaryMin.toLocaleString('pt-BR')} - R$ ${job.salaryMax.toLocaleString('pt-BR')}`
                                : job.salaryMin 
                                ? `A partir de R$ ${job.salaryMin.toLocaleString('pt-BR')}`
                                : `Até R$ ${job.salaryMax?.toLocaleString('pt-BR')}`
                              }
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Publicada em:</span>
                          <span className="text-gray-900">{new Date(job.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botão de candidatura mobile */}
                    <div className="pt-4 border-t border-gray-200 lg:hidden">
                      {hasApplied ? (
                        <div className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-green-100 text-green-800 rounded-lg">
                          <Clock className="h-4 w-4" />
                          <span>Candidatura enviada</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowApplicationModal(true)}
                          disabled={applying}
                          className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          <Send className="h-4 w-4" />
                          <span>Candidatar-se</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de candidatura */}
      <ApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onSubmit={handleApply}
        jobTitle={job?.title || ''}
        companyName={job?.company.name || ''}
        loading={applying}
      />
    </CandidateLayout>
  )
}