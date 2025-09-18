'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2, 
  FileText, 
  Users, 
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Minus,
  Info,
  Briefcase,
  Calendar,
  Globe,
  Target,
  Award,
  BookOpen,
  Lightbulb
} from 'lucide-react'
import LocationSelector from '@/components/ui/LocationSelector'

interface JobFormData {
  title: string
  description: string
  requirements: string
  responsibilities: string
  benefits: string
  location: string
  city?: string
  state?: string
  salaryMin: number
  salaryMax: number
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  level: 'JUNIOR' | 'PLENO' | 'SENIOR' | 'LEAD'
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'CLOSED'
  skills: string[]
  experienceYears: string
  education: string
  languages: string[]
}

interface JobFormErrors {
  title?: string
  description?: string
  requirements?: string
  location?: string
  salaryMin?: string
  salaryMax?: string
}

interface Job {
  id: string
  title: string
  description: string
  requirements?: string
  responsibilities?: string
  benefits?: string
  location?: string
  city?: string
  state?: string
  salaryMin?: number
  salaryMax?: number
  type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  level?: 'JUNIOR' | 'PLENO' | 'SENIOR' | 'LEAD'
  workMode: 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'CLOSED'
  skills?: string
  experienceYears?: number
  education?: string
  languages?: string
  createdAt: string
  _count: {
    applications: number
  }
}

export default function EditJob({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [job, setJob] = useState<Job | null>(null)
  const resolvedParams = use(params)
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    location: '',
    salaryMin: 1,
    salaryMax: 5000,
    type: 'FULL_TIME',
    level: 'PLENO',
    workMode: 'HYBRID',
    status: 'PENDING',
    skills: [],
    experienceYears: '',
    education: '',
    languages: []
  })
  const [errors, setErrors] = useState<JobFormErrors>({})
  const [showPreview, setShowPreview] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newLanguage, setNewLanguage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'COMPANY') {
      router.push('/login')
      return
    }

    fetchJob()
  }, [session, status, router, resolvedParams.id])

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/company/jobs/${resolvedParams.id}`)
      if (response.ok) {
        const jobData = await response.json()
        setJob(jobData)
        // Usar salaryMin e salaryMax diretamente do banco
        let salaryMin = jobData.salaryMin || 1
        let salaryMax = jobData.salaryMax || 5000
        
        console.log('=== LOADING JOB DATA ===')
        console.log('Job data received:', JSON.stringify(jobData, null, 2))
        
        // Mapear workMode do banco para o formulário
        let workModeForm: 'REMOTE' | 'HYBRID' | 'ONSITE' = 'HYBRID'
        if (jobData.workMode === 'REMOTO') workModeForm = 'REMOTE'
        else if (jobData.workMode === 'HIBRIDO') workModeForm = 'HYBRID'
        else if (jobData.workMode === 'PRESENCIAL') workModeForm = 'ONSITE'

        setFormData({
          title: jobData.title || '',
          description: jobData.description || '',
          requirements: jobData.requirements || '',
          responsibilities: jobData.responsibilities || '',
          benefits: jobData.benefits || '',
          location: jobData.location || '',
          city: jobData.city || '',
          state: jobData.state || '',
          salaryMin,
          salaryMax,
          type: jobData.type || 'FULL_TIME',
          level: jobData.level || 'PLENO',
          workMode: workModeForm,
          status: jobData.status || 'PENDING',
          skills: jobData.skills ? jobData.skills.split(', ').filter(Boolean) : [],
          experienceYears: jobData.experienceYears?.toString() || '',
          education: jobData.education || '',
          languages: jobData.languages ? jobData.languages.split(', ').filter(Boolean) : []
        })
        
        console.log('=== FORM DATA SET ===')
        console.log('Form data:', {
          title: jobData.title || '',
          description: jobData.description || '',
          requirements: jobData.requirements || '',
          location: jobData.location || '',
          city: jobData.city || '',
          state: jobData.state || '',
          salaryMin,
          salaryMax,
          status: jobData.status || 'PENDING'
        })
      } else {
        router.push('/empresa/vagas')
      }
    } catch (error) {
      console.error('Erro ao carregar vaga:', error)
      router.push('/empresa/vagas')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    console.log('=== VALIDATING FORM ===')
    console.log('Current formData:', JSON.stringify(formData, null, 2))
    
    const newErrors: JobFormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
      console.log('Validation error: Title is required')
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
      console.log('Validation error: Description is required')
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Requisitos são obrigatórios'
      console.log('Validation error: Requirements are required')
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Localização é obrigatória'
      console.log('Validation error: Location is required')
    }

    if (formData.salaryMin <= 0) {
      newErrors.salaryMin = 'Salário mínimo deve ser maior que zero'
    }

    if (formData.salaryMax <= 0) {
      newErrors.salaryMax = 'Salário máximo deve ser maior que zero'
    }

    if (formData.salaryMin > 0 && formData.salaryMax > 0 && formData.salaryMin >= formData.salaryMax) {
      newErrors.salaryMax = 'Salário máximo deve ser maior que o mínimo'
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    console.log('Validation result:', isValid ? 'PASSED' : 'FAILED')
    console.log('Validation errors:', newErrors)
    return isValid
  }

  const handleInputChange = (field: keyof JobFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field as keyof JobFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }))
      setNewLanguage('')
    }
  }

  const removeLanguage = (languageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(language => language !== languageToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      // Usar city e state do formData ou extrair do location se necessário
      let city = formData.city || ''
      let state = formData.state || ''
      
      // Se não temos city/state mas temos location (e não é remoto), tentar extrair
      if (!city && !state && formData.location && !formData.location.toLowerCase().includes('remoto')) {
        const parts = formData.location.split(',')
        if (parts.length >= 2) {
          city = parts[0].trim()
          state = parts[1].trim()
        }
      }
      
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        benefits: formData.benefits,
        location: formData.location,
        city,
        state,
        type: formData.type,
        level: formData.level,
        workMode: formData.workMode,
        status: formData.status,
        skills: formData.skills,
        experienceYears: formData.experienceYears,
        education: formData.education,
        languages: formData.languages,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax
      }
      
      console.log('=== FRONTEND DEBUG ===')
      console.log('Data being sent:', JSON.stringify(dataToSend, null, 2))
      console.log('Job ID:', resolvedParams.id)
      
      const response = await fetch(`/api/company/jobs/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        alert('Vaga atualizada com sucesso!')
        router.push('/empresa/vagas')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao atualizar vaga')
      }
    } catch (error) {
      console.error('Erro ao atualizar vaga:', error)
      alert('Erro ao atualizar vaga')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!job) return

    try {
      const response = await fetch(`/api/company/jobs/${resolvedParams.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Vaga excluída com sucesso!')
        router.push('/empresa/vagas')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao excluir vaga')
      }
    } catch (error) {
      console.error('Erro ao excluir vaga:', error)
      alert('Erro ao excluir vaga')
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getTypeLabel = (type: string) => {
    const types = {
      'FULL_TIME': 'Tempo Integral',
      'PART_TIME': 'Meio Período',
      'CONTRACT': 'Contrato',
      'INTERNSHIP': 'Estágio'
    }
    return types[type as keyof typeof types] || type
  }

  const getLevelLabel = (level: string) => {
    const levels = {
      'JUNIOR': 'Júnior',
      'PLENO': 'Pleno',
      'SENIOR': 'Sênior',
      'LEAD': 'Lead'
    }
    return levels[level as keyof typeof levels] || level
  }

  const getWorkModeLabel = (workMode: string) => {
    const modes = {
      'REMOTE': 'Remoto',
      'HYBRID': 'Híbrido',
      'ONSITE': 'Presencial'
    }
    return modes[workMode as keyof typeof modes] || workMode
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando vaga...</p>
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
                onClick={() => router.push('/empresa/vagas')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Voltar às vagas"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Vaga</h1>
                <div className="flex items-center space-x-3 mt-2">
                  {getStatusBadge(job.status)}
                  <span className="text-gray-600">
                    {job._count.applications} candidatura(s)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Ocultar' : 'Visualizar'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>
          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Vaga *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Desenvolvedor Full Stack"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Localização */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localização *
                </label>
                <LocationSelector
                  value={formData.location}
                  onChange={(location) => {
                    handleInputChange('location', location)
                    
                    // Atualizar city e state baseado na localização selecionada
                    if (location && !location.toLowerCase().includes('remoto')) {
                      const parts = location.split(',')
                      if (parts.length >= 2) {
                        const city = parts[0].trim()
                        const state = parts[1].trim()
                        setFormData(prev => ({ ...prev, city, state }))
                      }
                    } else {
                      // Se for remoto, limpar city e state
                      setFormData(prev => ({ ...prev, city: '', state: '' }))
                    }
                  }}
                  error={errors.location}
                  required
                />
              </div>

              {/* Range de Salário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faixa Salarial *
                </label>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="salaryMin" className="block text-xs text-gray-600 mb-1">
                      Salário Mínimo: {formatCurrency(formData.salaryMin)}
                    </label>
                    <input
                      type="range"
                      id="salaryMin"
                      min="1"
                      max="50000"
                      step="100"
                      value={formData.salaryMin}
                      onChange={(e) => handleInputChange('salaryMin', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="salaryMax" className="block text-xs text-gray-600 mb-1">
                      Salário Máximo: {formatCurrency(formData.salaryMax)}
                    </label>
                    <input
                      type="range"
                      id="salaryMax"
                      min="1"
                      max="50000"
                      step="100"
                      value={formData.salaryMax}
                      onChange={(e) => handleInputChange('salaryMax', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="text-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    Faixa: {formatCurrency(formData.salaryMin)} - {formatCurrency(formData.salaryMax)}
                  </div>
                  {errors.salaryMax && (
                    <p className="mt-1 text-sm text-red-600">{errors.salaryMax}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PENDING">Pendente</option>
                  <option value="APPROVED">Contratando</option>
                  <option value="REJECTED">Rejeitada</option>
                  <option value="PAUSED">Pausada</option>
                  <option value="CLOSED">Fechada</option>
                </select>
              </div>

              {/* Tipo de Contrato */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  Tipo de Contrato *
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="FULL_TIME">Tempo Integral</option>
                  <option value="PART_TIME">Meio Período</option>
                  <option value="CONTRACT">Contrato</option>
                  <option value="INTERNSHIP">Estágio</option>
                </select>
              </div>

              {/* Nível */}
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  <Award className="h-4 w-4 inline mr-1" />
                  Nível *
                </label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="JUNIOR">Júnior</option>
                  <option value="PLENO">Pleno</option>
                  <option value="SENIOR">Sênior</option>
                  <option value="LEAD">Lead</option>
                </select>
              </div>

              {/* Modo de Trabalho */}
              <div>
                <label htmlFor="workMode" className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Modo de Trabalho *
                </label>
                <select
                  id="workMode"
                  value={formData.workMode}
                  onChange={(e) => handleInputChange('workMode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="REMOTE">Remoto</option>
                  <option value="HYBRID">Híbrido</option>
                  <option value="ONSITE">Presencial</option>
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição da Vaga *
                </label>
                <textarea
                  id="description"
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Descreva as responsabilidades, objetivos e o que a pessoa fará no dia a dia..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Requisitos */}
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Requisitos *
                </label>
                <textarea
                  id="requirements"
                  rows={6}
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.requirements ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Liste as habilidades técnicas, experiência necessária, formação..."
                />
                {errors.requirements && (
                  <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>
                )}
              </div>

              {/* Responsabilidades */}
              <div>
                <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="h-4 w-4 inline mr-1" />
                  Responsabilidades
                </label>
                <textarea
                  id="responsibilities"
                  rows={4}
                  value={formData.responsibilities}
                  onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descreva as principais responsabilidades do cargo..."
                />
              </div>

              {/* Benefícios */}
              <div>
                <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-2">
                  <Award className="h-4 w-4 inline mr-1" />
                  Benefícios
                </label>
                <textarea
                  id="benefits"
                  rows={4}
                  value={formData.benefits}
                  onChange={(e) => handleInputChange('benefits', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Liste os benefícios oferecidos (plano de saúde, vale refeição, etc.)..."
                />
              </div>

              {/* Anos de Experiência */}
              <div>
                <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Anos de Experiência
                </label>
                <input
                  type="text"
                  id="experienceYears"
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 2-3 anos, 5+ anos, Sem experiência"
                />
              </div>

              {/* Educação */}
              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="h-4 w-4 inline mr-1" />
                  Educação
                </label>
                <input
                  type="text"
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Ensino Superior em Tecnologia, Técnico em Informática"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lightbulb className="h-4 w-4 inline mr-1" />
                  Habilidades Técnicas
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite uma habilidade e pressione Enter"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Idiomas
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite um idioma e pressione Enter"
                    />
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((language, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        {language}
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/empresa/vagas')}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Visualização</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {formData.title || 'Título da Vaga'}
                  </h3>
                  <div className="flex items-center space-x-3 mb-4">
                    {getStatusBadge(formData.status)}
                    <span className="text-gray-600">
                      {formData.location || 'Localização'}
                    </span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(formData.salaryMin)} - {formatCurrency(formData.salaryMax)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {getTypeLabel(formData.type)}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {getLevelLabel(formData.level)}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {getWorkModeLabel(formData.workMode)}
                    </span>
                    {formData.experienceYears && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        {formData.experienceYears}
                      </span>
                    )}
                  </div>
                </div>

                {formData.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {formData.description}
                      </p>
                    </div>
                  </div>
                )}

                {formData.requirements && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requisitos</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {formData.requirements}
                      </p>
                    </div>
                  </div>
                )}

                {formData.responsibilities && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Responsabilidades</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {formData.responsibilities}
                      </p>
                    </div>
                  </div>
                )}

                {formData.benefits && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Benefícios</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {formData.benefits}
                      </p>
                    </div>
                  </div>
                )}

                {formData.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Habilidades Técnicas</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.languages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Idiomas</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.education && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Educação</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600">
                        {formData.education}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-2">
                    Publicada em {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
                    Candidatar-se
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirmar Exclusão</h2>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir a vaga "{job.title}"? Esta ação não pode ser desfeita.
              {job._count.applications > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Atenção: Esta vaga possui {job._count.applications} candidatura(s).
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir Vaga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}