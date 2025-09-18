'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building, 
  Phone, 
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronRight,
  Shield,
  Users,
  Target,
  Award,
  Globe,
  Briefcase,
  GraduationCap,
  Heart,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useIBGELocation } from '@/hooks/useIBGELocation'

type UserType = 'CANDIDATE' | 'COMPANY'
type Step = 1 | 2 | 3 | 4

export default function CadastroPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [userType, setUserType] = useState<UserType>('CANDIDATE')
  const { estados, municipios, loadingEstados, loadingMunicipios, fetchMunicipios } = useIBGELocation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    state: '',
    // Company specific
    companyName: '',
    sector: '',
    website: '',
    // Additional fields
    birthDate: '',
    disability: '',
    experience: '',
    skills: '',
    linkedin: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const router = useRouter()

  const steps = [
    { number: 1, title: 'Tipo de Conta', description: 'Escolha como você quer usar a plataforma' },
    { number: 2, title: 'Dados Básicos', description: 'Informações pessoais e de contato' },
    { number: 3, title: 'Localização', description: 'Onde você está localizado' },
    { number: 4, title: 'Finalização', description: 'Confirme seus dados e crie sua conta' }
  ]

  const benefits = [
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Seus dados protegidos com criptografia"
    },
    {
      icon: Users,
      title: "Comunidade Inclusiva",
      description: "Conecte-se com pessoas que entendem você"
    },
    {
      icon: Target,
      title: "Oportunidades Únicas",
      description: "Vagas pensadas para suas necessidades"
    },
    {
      icon: Award,
      title: "Empresas Certificadas",
      description: "Parceiros comprometidos com a diversidade"
    }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    if (name === 'email') {
      setEmailError('')
    }
  }

  const handleEmailBlur = () => {
    if (formData.email && formData.email.includes('@')) {
      checkEmailAvailability(formData.email)
    }
  }

  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) return
    
    setIsCheckingEmail(true)
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      let data: any = {}
      
      try {
        const text = await response.text()
        if (text) {
          data = JSON.parse(text)
        }
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError)
        setEmailError('Erro de comunicação com o servidor')
        return
      }
      
      if (response.status === 400) {
        // Email já existe
        setEmailError(data.error || 'Email já cadastrado')
      } else if (response.status === 200) {
        // Email disponível
        setEmailError('')
      } else if (response.status === 500) {
        // Erro interno do servidor
        setEmailError('Erro interno do servidor. Tente novamente.')
      } else {
        // Outros erros
        setEmailError(data.error || 'Erro ao verificar email')
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setEmailError('Erro de conexão. Verifique sua internet.')
      } else {
        setEmailError('Erro inesperado. Tente novamente.')
      }
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleEstadoChange = (estadoSigla: string) => {
    setFormData(prev => ({ ...prev, state: estadoSigla, city: '' }))
    const estado = estados.find(e => e.sigla === estadoSigla)
    if (estado) {
      fetchMunicipios(estado.id)
    }
  }

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        return userType !== null
      case 2:
        if (userType === 'COMPANY') {
          return !!(formData.name && formData.email && formData.password && 
                   formData.confirmPassword && formData.companyName && formData.sector)
        }
        return !!(formData.name && formData.email && formData.password && formData.confirmPassword)
      case 3:
        return !!(formData.state && formData.city)
      case 4:
        const hasRequiredFields = formData.name && formData.email && formData.password && formData.confirmPassword && formData.state && formData.city
        const hasCompanyFields = userType === 'COMPANY' ? (formData.companyName && formData.sector) : true
        const passwordsMatch = formData.password === formData.confirmPassword
        const passwordValid = formData.password.length >= 6
        return acceptTerms && !emailError && hasRequiredFields && hasCompanyFields && passwordsMatch && passwordValid
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validações básicas
    if (!acceptTerms) {
      setError('Você deve aceitar os termos de uso e política de privacidade')
      setIsLoading(false)
      return
    }

    if (emailError) {
      setError('Corrija os erros no formulário antes de continuar')
      setIsLoading(false)
      return
    }

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Preencha todos os campos obrigatórios')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    if (!userType) {
      setError('Selecione o tipo de conta')
      setIsLoading(false)
      return
    }

    if (!formData.state || !formData.city) {
      setError('Selecione sua localização')
      setIsLoading(false)
      return
    }

    // Validações específicas para empresa
    if (userType === 'COMPANY' && (!formData.companyName || !formData.sector)) {
      setError('Preencha todos os campos obrigatórios da empresa')
      setIsLoading(false)
      return
    }

    try {
      const requestData = {
        ...formData,
        role: userType
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (response.ok) {
        setShowSuccessPopup(true)
      } else {
        setError(data.error || 'Erro ao criar conta')
      }
    } catch (error) {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Como você quer usar a Xpecial?</h2>
              <p className="text-gray-600">Escolha o tipo de conta que melhor se adequa ao seu objetivo</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => setUserType('CANDIDATE')}
                className={`p-6 border-2 rounded-2xl text-left transition-all duration-200 hover:shadow-lg ${
                  userType === 'CANDIDATE'
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${
                    userType === 'CANDIDATE' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <User className={`h-6 w-6 ${
                      userType === 'CANDIDATE' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Sou Candidato</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Buscar oportunidades de trabalho inclusivas e desenvolver minhas habilidades
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• Buscar vagas inclusivas</li>
                      <li>• Fazer cursos gratuitos</li>
                      <li>• Conectar com empresas</li>
                    </ul>
                  </div>
                  {userType === 'CANDIDATE' && (
                    <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUserType('COMPANY')}
                className={`p-6 border-2 rounded-2xl text-left transition-all duration-200 hover:shadow-lg ${
                  userType === 'COMPANY'
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${
                    userType === 'COMPANY' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Building className={`h-6 w-6 ${
                      userType === 'COMPANY' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Sou Empresa</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Encontrar talentos únicos e promover a diversidade na minha organização
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• Publicar vagas inclusivas</li>
                      <li>• Encontrar candidatos qualificados</li>
                      <li>• Promover diversidade</li>
                    </ul>
                  </div>
                  {userType === 'COMPANY' && (
                    <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Dados Básicos</h2>
              <p className="text-gray-600">Vamos conhecer você melhor</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  {userType === 'COMPANY' ? 'Nome do responsável' : 'Nome completo'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleEmailBlur}
                    className={`pl-10 pr-10 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      emailError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="seu@email.com"
                  />
                  {isCheckingEmail && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  {!isCheckingEmail && formData.email && !emailError && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
                {emailError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirme sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {userType === 'COMPANY' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome da empresa
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Nome da sua empresa"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sector" className="block text-sm font-semibold text-gray-700 mb-2">
                    Setor de atuação
                  </label>
                  <select
                    id="sector"
                    name="sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Selecione o setor</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Educação">Educação</option>
                    <option value="Varejo">Varejo</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Indústria">Indústria</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="website" className="block text-sm font-semibold text-gray-700 mb-2">
                    Website (opcional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://www.suaempresa.com"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Localização</h2>
              <p className="text-gray-600">Onde você está localizado?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={(e) => handleEstadoChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loadingEstados}
                >
                  <option value="">Selecione o estado</option>
                  {estados.map((estado) => (
                    <option key={estado.id} value={estado.sigla}>
                      {estado.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                  Cidade
                </label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={!formData.state || loadingMunicipios}
                >
                  <option value="">Selecione a cidade</option>
                  {municipios.map((municipio) => (
                    <option key={municipio.id} value={municipio.nome}>
                      {municipio.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone (opcional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quase lá!</h2>
              <p className="text-gray-600">Revise seus dados e finalize seu cadastro</p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">Resumo dos seus dados</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tipo de conta:</span>
                  <span className="ml-2 font-medium">
                    {userType === 'CANDIDATE' ? 'Candidato' : 'Empresa'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Nome:</span>
                  <span className="ml-2 font-medium">{formData.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{formData.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Localização:</span>
                  <span className="ml-2 font-medium">{formData.city}, {formData.state}</span>
                </div>
                {userType === 'COMPANY' && (
                  <>
                    <div>
                      <span className="text-gray-600">Empresa:</span>
                      <span className="ml-2 font-medium">{formData.companyName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Setor:</span>
                      <span className="ml-2 font-medium">{formData.sector}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-relaxed">
                  Eu aceito os{' '}
                  <Link href="/termos" className="text-blue-600 hover:text-blue-500 font-medium">
                    Termos de Uso
                  </Link>
                  {' '}e a{' '}
                  <Link href="/privacidade" className="text-blue-600 hover:text-blue-500 font-medium">
                    Política de Privacidade
                  </Link>
                  {' '}da Xpecial. Concordo em receber comunicações sobre oportunidades e atualizações da plataforma.
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="mx-auto mb-4 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">X</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Criar Conta
              </h1>
              <p className="text-gray-600 text-lg">Junte-se à maior plataforma de empregos inclusivos</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    currentStep >= step.number
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.number}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-full h-0.5 mx-4 transition-all duration-200 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">{steps[currentStep - 1].title}</h3>
              <p className="text-sm text-gray-600">{steps[currentStep - 1].description}</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={currentStep === 4 ? handleSubmit : (e) => e.preventDefault()}>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      validateStep(currentStep)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !validateStep(currentStep)}
                    className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      validateStep(currentStep) && !isLoading
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 transform hover:scale-[1.02]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Criando conta...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Criar minha conta
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link 
                  href="/login" 
                  className="font-semibold text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Sua jornada inclusiva começa aqui
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Conecte-se com oportunidades que valorizam sua singularidade
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-8 mb-12">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                    <p className="text-blue-100">{benefit.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">10K+</div>
              <div className="text-blue-200 text-sm">Candidatos ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-blue-200 text-sm">Empresas parceiras</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">95%</div>
              <div className="text-blue-200 text-sm">Taxa de satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">2K+</div>
              <div className="text-blue-200 text-sm">Vagas preenchidas</div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="font-medium">Cadastro 100% gratuito</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Cadastro Realizado com Sucesso!
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Seu cadastro foi feito com sucesso, por gentileza verificar o email para autenticação.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Ir para Login
              </button>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}