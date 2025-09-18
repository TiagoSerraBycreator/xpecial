'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { 
  Award, 
  Users, 
  Briefcase, 
  GraduationCap, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Shield,
  Target,
  Heart,
  Zap,
  Globe,
  TrendingUp,
  Building,
  UserCheck,
  BookOpen,
  Sparkles,
  Play,
  Quote,
  ChevronRight,
  MapPin,
  Clock,
  Trophy,
  Lightbulb,
  Rocket
} from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Desenvolvedora Frontend",
      company: "TechCorp",
      content: "A Xpecial mudou minha vida! Encontrei uma empresa que realmente valoriza a diversidade e hoje trabalho em projetos incríveis.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Analista de Dados",
      company: "DataFlow",
      content: "Os cursos da plataforma me deram as habilidades necessárias para conseguir minha primeira vaga na área de tecnologia.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Designer UX",
      company: "Creative Studio",
      content: "Nunca imaginei que seria tão fácil encontrar uma empresa que entende minhas necessidades. Recomendo para todos!",
      rating: 5
    }
  ]

  const features = [
    {
      icon: Target,
      title: "Vagas Direcionadas",
      description: "Oportunidades específicas para pessoas com deficiência em empresas comprometidas com a inclusão",
      color: "blue"
    },
    {
      icon: BookOpen,
      title: "Academia Inclusiva",
      description: "Cursos online acessíveis com certificados reconhecidos pelo mercado de trabalho",
      color: "green"
    },
    {
      icon: Users,
      title: "Comunidade Ativa",
      description: "Rede de apoio com profissionais, mentores e empresas focadas em diversidade",
      color: "purple"
    },
    {
      icon: Shield,
      title: "Ambiente Seguro",
      description: "Plataforma protegida contra discriminação, garantindo respeito e igualdade",
      color: "orange"
    },
    {
      icon: Zap,
      title: "Matching Inteligente",
      description: "Algoritmo que conecta candidatos às vagas mais adequadas ao seu perfil",
      color: "pink"
    },
    {
      icon: Trophy,
      title: "Resultados Comprovados",
      description: "Mais de 85% dos nossos usuários conseguem colocação em até 3 meses",
      color: "indigo"
    }
  ]

  const stats = [
    { number: "10K+", label: "Candidatos Ativos", icon: Users },
    { number: "500+", label: "Empresas Parceiras", icon: Building },
    { number: "2K+", label: "Vagas Preenchidas", icon: Briefcase },
    { number: "95%", label: "Taxa de Satisfação", icon: Star }
  ]

  const companies = [
    "Microsoft", "Google", "Amazon", "IBM", "Accenture", "Deloitte", "PwC", "Banco do Brasil"
  ]

  useEffect(() => {
    if (status === 'loading') return

    if (session) {
      setIsRedirecting(true)
      // Redirecionar baseado no role do usuário
      if (session.user.role === 'ADMIN') {
        router.push('/admin')
      } else if (session.user.role === 'COMPANY') {
        router.push('/empresa')
      } else {
        router.push('/candidato')
      }
    }
  }, [session, status, router])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  if (status === 'loading' || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Xpecial</h1>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout showNavigation={false} className="px-0">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Plataforma #1 em Inclusão</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Sua carreira
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  sem limites
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed">
                Conectamos talentos únicos com empresas que valorizam a diversidade. 
                Transforme sua diferença em sua maior força.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200">
                  <Link href="/cadastro" className="flex items-center justify-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Começar Agora
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 backdrop-blur-sm">
                  <Link href="#como-funciona" className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Como Funciona
                  </Link>
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>100% Gratuito</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Dados Protegidos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>4.9/5 Avaliação</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <Icon className="h-8 w-8 mb-4 text-yellow-300" />
                    <div className="text-3xl font-bold mb-2">{stat.number}</div>
                    <div className="text-blue-200 text-sm">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 font-medium">Empresas que confiam na Xpecial</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="text-gray-400 font-semibold text-lg hover:text-gray-600 transition-colors">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-full font-medium mb-4">
              <Lightbulb className="h-4 w-4 mr-2" />
              Por que escolher a Xpecial?
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa pensada para conectar talentos únicos com oportunidades especiais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600',
                pink: 'bg-pink-100 text-pink-600',
                indigo: 'bg-indigo-100 text-indigo-600'
              }
              
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 ${colorClasses[feature.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Como funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Em apenas 3 passos simples, você pode começar sua jornada rumo ao emprego dos sonhos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Crie seu perfil",
                description: "Cadastre-se gratuitamente e conte sua história. Destacamos suas habilidades e experiências únicas.",
                icon: UserCheck,
                color: "blue"
              },
              {
                step: "02", 
                title: "Desenvolva suas skills",
                description: "Acesse nossa academia online com cursos gratuitos e certificados reconhecidos pelo mercado.",
                icon: GraduationCap,
                color: "green"
              },
              {
                step: "03",
                title: "Conecte-se com empresas",
                description: "Nosso algoritmo conecta você com vagas que valorizam seu perfil e suas necessidades específicas.",
                icon: Building,
                color: "purple"
              }
            ].map((step, index) => {
              const Icon = step.icon
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600'
              }
              
              return (
                <div key={index} className="relative text-center group">
                  {/* Connection Line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 z-0"></div>
                  )}
                  
                  <div className="relative z-10">
                    <div className={`w-32 h-32 mx-auto mb-6 bg-gradient-to-br ${colorClasses[step.color as keyof typeof colorClasses]} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                    <div className="text-sm font-bold text-gray-400 mb-2">{step.step}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Histórias de sucesso
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja como a Xpecial transformou a vida profissional de milhares de pessoas
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
              <Quote className="h-12 w-12 text-blue-600 mb-6" />
              
              <blockquote className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {testimonials[currentTestimonial].name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonials[currentTestimonial].name}</div>
                    <div className="text-gray-600">{testimonials[currentTestimonial].role}</div>
                    <div className="text-sm text-gray-500">{testimonials[currentTestimonial].company}</div>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Testimonial Indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 75% 25%, white 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <Rocket className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Comece hoje mesmo</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Pronto para transformar sua carreira?
          </h2>
          
          <p className="text-xl lg:text-2xl mb-10 text-blue-100 leading-relaxed">
            Junte-se a mais de 10.000 profissionais que já encontraram oportunidades especiais na Xpecial.
            Sua próxima oportunidade está a um clique de distância.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200">
              <Link href="/cadastro" className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cadastrar como Candidato
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 backdrop-blur-sm">
              <Link href="/cadastro" className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Sou uma Empresa
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Cadastro gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Ativação em 2 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Dados 100% seguros</span>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
