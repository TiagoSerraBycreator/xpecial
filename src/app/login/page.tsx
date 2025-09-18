'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Building2, 
  Star,
  Shield,
  Zap,
  Heart,
  Globe,
  Award,
  TrendingUp,
  Target,
  Sparkles,
  ChevronRight,
  Play,
  Quote
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const router = useRouter()

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Desenvolvedora Frontend",
      company: "TechCorp",
      content: "Encontrei minha vaga dos sonhos através da Xpecial. A plataforma é inclusiva e realmente se preocupa com a diversidade.",
      avatar: "MS"
    },
    {
      name: "João Santos",
      role: "Designer UX",
      company: "StartupXYZ",
      content: "A Xpecial me conectou com empresas que valorizam pessoas com deficiência. Processo transparente e respeitoso.",
      avatar: "JS"
    },
    {
      name: "Ana Costa",
      role: "Gerente de Projetos",
      company: "InnovaCorp",
      content: "Plataforma incrível! Consegui uma posição que se adapta perfeitamente às minhas necessidades especiais.",
      avatar: "AC"
    }
  ]

  const features = [
    {
      icon: Shield,
      title: "Ambiente Seguro",
      description: "Proteção total dos seus dados pessoais"
    },
    {
      icon: Users,
      title: "Inclusão Real",
      description: "Vagas pensadas para pessoas com deficiência"
    },
    {
      icon: Target,
      title: "Match Perfeito",
      description: "Algoritmo que conecta você às melhores oportunidades"
    },
    {
      icon: Award,
      title: "Empresas Certificadas",
      description: "Parceiros comprometidos com a diversidade"
    }
  ]

  const stats = [
    { number: "10K+", label: "Candidatos ativos" },
    { number: "500+", label: "Empresas parceiras" },
    { number: "95%", label: "Taxa de satisfação" },
    { number: "2K+", label: "Vagas preenchidas" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🔄 Enviando credenciais:', { email, password: '***' })
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      console.log('📥 Resultado do signIn:', result)

      if (result?.error) {
        console.log('❌ Erro no login:', result.error)
        setError('Email ou senha inválidos')
      } else {
        console.log('✅ Login bem-sucedido')
        const session = await getSession()
        
        // Redirecionar baseado no role do usuário
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin')
        } else if (session?.user?.role === 'COMPANY') {
          router.push('/empresa')
        } else {
          router.push('/candidato')
        }
      }
    } catch (error) {
      console.log('💥 Erro capturado:', error)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto mb-4 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">X</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Xpecial
              </h1>
              <p className="text-gray-600 text-lg">Bem-vindo de volta!</p>
              <p className="text-gray-500 text-sm mt-1">Entre na sua conta para continuar</p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="seu@email.com"
                    aria-describedby="email-error"
                  />
                </div>
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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="Sua senha"
                    aria-describedby="password-error"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Lembrar de mim
                  </label>
                </div>

                <div className="text-sm">
                  <Link 
                    href="/forgot-password" 
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2" role="alert" aria-live="polite">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link 
                  href="/cadastro" 
                  className="font-semibold text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors"
                >
                  Cadastre-se gratuitamente
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {stats.slice(0, 2).map((stat, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-blue-600">{stat.number}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Features and Testimonials */}
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
              Conectando talentos únicos com oportunidades especiais
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              A primeira plataforma de empregos verdadeiramente inclusiva do Brasil
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-blue-100">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <Quote className="h-6 w-6 text-blue-200 mr-2" />
              <span className="text-sm text-blue-200 font-medium">Depoimento</span>
            </div>
            
            <div className="mb-4">
              <p className="text-lg leading-relaxed mb-4">
                "{testimonials[currentTestimonial].content}"
              </p>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center font-semibold text-sm">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonials[currentTestimonial].name}</div>
                  <div className="text-sm text-blue-200">
                    {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Indicators */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-2 gap-6 mt-12">
            {stats.slice(2).map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Link 
              href="/cadastro"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors group"
            >
              Criar conta gratuita
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}