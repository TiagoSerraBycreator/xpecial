'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { ArrowLeft, Users, Calendar, MapPin, DollarSign, Eye, Mail, Phone, MessageCircle, CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react'

interface JobDetails {
  id: string
  title: string
  description: string
  requirements: string
  city?: string
  state?: string
  salaryMin?: number
  salaryMax?: number
  workMode: 'REMOTE' | 'HYBRID' | 'ON_SITE'
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'PAUSED'
  createdAt: string
  company: {
    name: string
  }
  applications: Application[]
  _count: {
    applications: number
  }
}

interface Application {
  id: string
  status: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'HIRED' | 'REJECTED'
  createdAt: string
  message?: string
  whatsappConsent: boolean
  candidate: {
    id: string
    phone?: string
    address?: string
    city?: string
    state?: string
    experience?: string
    education?: string
    skills?: string
    dateOfBirth?: string
    description?: string
    aboutMe?: string
    profileVideoUrl?: string
    user: {
      name: string
      email: string
    }
  }
}

export default function JobCandidates({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [job, setJob] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [processingApplications, setProcessingApplications] = useState<Set<string>>(new Set())
  const resolvedParams = use(params)

  // Função para extrair ID do vídeo do YouTube
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'COMPANY') {
      router.push('/login')
      return
    }

    fetchJobDetails()
  }, [session, status, router, resolvedParams.id])

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/company/jobs/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setJob(data)
      } else {
        router.push('/empresa/vagas')
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da vaga:', error)
      router.push('/empresa/vagas')
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationStatusChange = async (applicationId: string, newStatus: string) => {
    setProcessingApplications(prev => new Set(prev).add(applicationId))
    
    try {
      const response = await fetch(`/api/company/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchJobDetails()
        
        const statusMessages = {
          HIRED: 'Candidato contratado com sucesso!',
          REJECTED: 'Candidatura rejeitada.',
          SCREENING: 'Candidatura em triagem.',
          INTERVIEW: 'Candidato selecionado para entrevista.',
          APPLIED: 'Status alterado para aplicado.'
        }
        
        alert(statusMessages[newStatus as keyof typeof statusMessages] || 'Status atualizado com sucesso!')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status')
    } finally {
      setProcessingApplications(prev => {
        const newSet = new Set(prev)
        newSet.delete(applicationId)
        return newSet
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: 'Contratando', className: 'bg-green-100 text-green-800' },
      CLOSED: { label: 'Fechada', className: 'bg-red-100 text-red-800' },
      DRAFT: { label: 'Rascunho', className: 'bg-gray-100 text-gray-800' },
      PAUSED: { label: 'Pausada', className: 'bg-yellow-100 text-yellow-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getApplicationStatusBadge = (status: string) => {
    const statusConfig = {
      APPLIED: { label: 'Aplicada', className: 'bg-yellow-100 text-yellow-800' },
      SCREENING: { label: 'Em Triagem', className: 'bg-blue-100 text-blue-800' },
      INTERVIEW: { label: 'Entrevista', className: 'bg-purple-100 text-purple-800' },
      HIRED: { label: 'Aprovada', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejeitada', className: 'bg-red-100 text-red-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getWorkModeBadge = (workMode: string) => {
    const workModeConfig = {
      REMOTE: { label: 'Remoto', className: 'bg-green-100 text-green-800' },
      HYBRID: { label: 'Híbrido', className: 'bg-blue-100 text-blue-800' },
      ON_SITE: { label: 'Presencial', className: 'bg-purple-100 text-purple-800' }
    }
    const config = workModeConfig[workMode as keyof typeof workModeConfig] || { label: workMode, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'A combinar'
    if (min && max) return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`
    if (min) return `A partir de R$ ${min.toLocaleString()}`
    if (max) return `Até R$ ${max.toLocaleString()}`
    return 'A combinar'
  }

  const filteredApplications = job?.applications.filter(application => {
    const matchesStatus = statusFilter === 'ALL' || application.status === statusFilter
    const matchesSearch = searchTerm === '' || 
      application.candidate.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.candidate.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  }) || []

  const renderSkills = (skillsData: string) => {
    try {
      const skills = JSON.parse(skillsData || '[]')
      if (Array.isArray(skills) && skills.length > 0) {
        return (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 3).map((skill: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{skills.length - 3} mais
              </span>
            )}
          </div>
        )
      }
    } catch (error) {
      // Se não for JSON válido, exibe como texto
    }
    return <span className="text-sm text-gray-600">{skillsData || 'Não informado'}</span>
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando candidatos...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vaga não encontrada</h2>
          <p className="text-gray-600 mb-4">A vaga que você está procurando não existe ou foi removida.</p>
          <button
            onClick={() => router.push('/empresa/vagas')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Voltar às Vagas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push(`/empresa/vagas/${job.id}`)}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Voltar aos detalhes da vaga"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Candidatos - {job.title}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  {getStatusBadge(job.status)}
                  {getWorkModeBadge(job.workMode)}
                  <span className="text-gray-600 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {job._count.applications} candidatura{job._count.applications !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Job Info Card */}
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {job.city && job.state ? `${job.city}, ${job.state}` : 'Localização não informada'}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Criada em {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">Todos os status</option>
                    <option value="APPLIED">Aplicadas</option>
                    <option value="SCREENING">Em Triagem</option>
                    <option value="INTERVIEW">Entrevista</option>
                    <option value="HIRED">Aprovadas</option>
                    <option value="REJECTED">Rejeitadas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {filteredApplications.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {job.applications.length === 0 ? 'Nenhuma candidatura ainda' : 'Nenhum candidato encontrado'}
                  </h3>
                  <p className="text-gray-600">
                    {job.applications.length === 0 
                      ? 'Quando alguém se candidatar a esta vaga, aparecerá aqui.'
                      : 'Tente ajustar os filtros para encontrar candidatos.'
                    }
                  </p>
                </div>
              ) : (
                filteredApplications.map((application) => (
                  <div key={application.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.candidate.user.name}
                            </h3>
                            {getApplicationStatusBadge(application.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <Mail className="h-4 w-4 mr-2" />
                                {application.candidate.user.email}
                              </div>
                              {application.candidate.phone && (
                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {application.candidate.phone}
                                  {application.whatsappConsent && (
                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      WhatsApp OK
                                    </span>
                                  )}
                                </div>
                              )}
                              {application.candidate.city && application.candidate.state && (
                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {application.candidate.city}, {application.candidate.state}
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Candidatura:</span> {new Date(application.createdAt).toLocaleDateString('pt-BR')}
                              </div>
                              {application.candidate.skills && (
                                <div className="mb-2">
                                  <span className="text-sm font-medium text-gray-700 block mb-1">Habilidades:</span>
                                  {renderSkills(application.candidate.skills)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {application.message && (
                            <div className="mb-4">
                              <span className="text-sm font-medium text-gray-700">Carta de apresentação:</span>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{application.message}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          

                          
                          {(application.status === 'APPLIED' || application.status === 'SCREENING' || application.status === 'INTERVIEW') && (
                            <>
                              <button
                                onClick={() => handleApplicationStatusChange(application.id, 'HIRED')}
                                disabled={processingApplications.has(application.id)}
                                className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Aprovar candidatura"
                              >
                                {processingApplications.has(application.id) ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleApplicationStatusChange(application.id, 'REJECTED')}
                                disabled={processingApplications.has(application.id)}
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Rejeitar candidatura"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{job._count.applications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aplicadas:</span>
                  <span className="font-medium text-yellow-600">
                    {job.applications.filter(app => app.status === 'APPLIED').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Em Triagem:</span>
                  <span className="font-medium text-blue-600">
                    {job.applications.filter(app => app.status === 'SCREENING').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aprovadas:</span>
                  <span className="font-medium text-green-600">
                    {job.applications.filter(app => app.status === 'HIRED').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejeitadas:</span>
                  <span className="font-medium text-red-600">
                    {job.applications.filter(app => app.status === 'REJECTED').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/empresa/vagas/${job.id}`)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver Detalhes da Vaga
                </button>
                <button
                  onClick={() => router.push(`/empresa/vagas/${job.id}/editar`)}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Editar Vaga
                </button>
                <button
                  onClick={() => router.push('/empresa/vagas')}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Todas as Vagas
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {selectedApplication.candidate.user.name}
                  </h2>
                  <div className="flex items-center space-x-3">
                    {getApplicationStatusBadge(selectedApplication.status)}
                    <span className="text-sm text-gray-600">
                      Candidatura em {new Date(selectedApplication.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Informações de Contato</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-600 mr-3" />
                        <span className="text-sm text-black font-medium">{selectedApplication.candidate.user.email}</span>
                      </div>
                      {selectedApplication.candidate.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-600 mr-3" />
                          <span className="text-sm text-black font-medium">{selectedApplication.candidate.phone}</span>
                          {selectedApplication.whatsappConsent && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              WhatsApp autorizado
                            </span>
                          )}
                        </div>
                      )}
                      {selectedApplication.candidate.city && selectedApplication.candidate.state && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-600 mr-3" />
                          <span className="text-sm text-black font-medium">
                            {selectedApplication.candidate.city}, {selectedApplication.candidate.state}
                          </span>
                        </div>
                      )}
                      {selectedApplication.candidate.dateOfBirth && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-600 mr-3" />
                          <span className="text-sm text-black font-medium">
                            {new Date(selectedApplication.candidate.dateOfBirth).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedApplication.candidate.description && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Descrição</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-black font-medium whitespace-pre-wrap">{selectedApplication.candidate.description}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.candidate.aboutMe && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Sobre Mim</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-black font-medium whitespace-pre-wrap">{selectedApplication.candidate.aboutMe}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.candidate.profileVideoUrl && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Vídeo de Apresentação</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {getYouTubeVideoId(selectedApplication.candidate.profileVideoUrl) ? (
                          <div className="aspect-video w-full max-w-md">
                            <iframe
                              src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedApplication.candidate.profileVideoUrl)}`}
                              title="Vídeo de Apresentação do Candidato"
                              className="w-full h-full rounded-lg"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        ) : (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600">
                              URL do vídeo inválida. 
                              <a 
                                href={selectedApplication.candidate.profileVideoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline ml-1"
                              >
                                Clique aqui para acessar
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.candidate.skills && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Habilidades</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {renderSkills(selectedApplication.candidate.skills)}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  {selectedApplication.candidate.experience && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Experiência Profissional</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-black font-medium whitespace-pre-wrap">{selectedApplication.candidate.experience}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.candidate.education && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Formação Acadêmica</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-black font-medium whitespace-pre-wrap">{selectedApplication.candidate.education}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedApplication.message && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Carta de Apresentação</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-black font-medium whitespace-pre-wrap">{selectedApplication.message}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                {(selectedApplication.status === 'APPLIED' || selectedApplication.status === 'SCREENING' || selectedApplication.status === 'INTERVIEW') && (
                  <>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={() => {
                          handleApplicationStatusChange(selectedApplication.id, 'SCREENING')
                          setSelectedApplication(null)
                        }}
                        disabled={processingApplications.has(selectedApplication.id)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingApplications.has(selectedApplication.id) ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                        <span className="font-medium">{processingApplications.has(selectedApplication.id) ? 'Processando...' : 'Triagem'}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleApplicationStatusChange(selectedApplication.id, 'INTERVIEW')
                          setSelectedApplication(null)
                        }}
                        disabled={processingApplications.has(selectedApplication.id)}
                        className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingApplications.has(selectedApplication.id) ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <MessageCircle className="h-5 w-5" />
                        )}
                        <span className="font-medium">{processingApplications.has(selectedApplication.id) ? 'Processando...' : 'Entrevista'}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleApplicationStatusChange(selectedApplication.id, 'HIRED')
                          setSelectedApplication(null)
                        }}
                        disabled={processingApplications.has(selectedApplication.id)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingApplications.has(selectedApplication.id) ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <CheckCircle className="h-5 w-5" />
                        )}
                        <span className="font-medium">{processingApplications.has(selectedApplication.id) ? 'Processando...' : 'Contratar'}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleApplicationStatusChange(selectedApplication.id, 'REJECTED')
                          setSelectedApplication(null)
                        }}
                        disabled={processingApplications.has(selectedApplication.id)}
                        className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingApplications.has(selectedApplication.id) ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                        <span className="font-medium">{processingApplications.has(selectedApplication.id) ? 'Processando...' : 'Rejeitar'}</span>
                      </button>
                    </div>
                  </>
                )}
                
                {selectedApplication.status === 'HIRED' && (
                  <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Candidatura Aprovada</span>
                  </div>
                )}
                
                {selectedApplication.status === 'REJECTED' && (
                  <div className="bg-red-100 text-red-800 px-6 py-3 rounded-lg flex items-center space-x-2">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Candidatura Rejeitada</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}