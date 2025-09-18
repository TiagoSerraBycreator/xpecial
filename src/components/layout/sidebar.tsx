'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Home,
  User,
  Briefcase,
  Building2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  GraduationCap,
  MessageSquare,
  Bell,
  Award,
  FileText,
  Search
} from 'lucide-react'

interface CustomMenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  isActive?: boolean;
}

interface SidebarProps {
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
  customMenuItems?: CustomMenuItem[]
}

export default function Sidebar({ isExpanded, setIsExpanded, customMenuItems }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsExpanded(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsExpanded])

  // Get menu items based on user role
  const getMenuItems = () => {
    if (!session?.user) return []

    if (session.user.role === 'ADMIN') {
      return [
        {
          name: 'Insights',
          href: '/admin/insights',
          icon: BarChart3,
          description: 'Análises e métricas'
        },
        {
          name: 'Usuários',
          href: '/admin/users',
          icon: Users,
          description: 'Gerenciar usuários'
        },
        {
          name: 'Vagas',
          href: '/admin/jobs',
          icon: Briefcase,
          description: 'Gerenciar vagas'
        },
        {
          name: 'Perfil',
          href: '/admin/perfil',
          icon: User,
          description: 'Configurações do perfil'
        }
      ]
    }

    if (session.user.role === 'COMPANY') {
      return [
        {
          name: 'Vagas',
          href: '/empresa/vagas',
          icon: Briefcase,
          description: 'Minhas vagas'
        },
        {
          name: 'Candidatos',
          href: '/empresa/candidatos',
          icon: Users,
          description: 'Candidatos interessados'
        },
        {
          name: 'Mensagens',
          href: '/empresa/mensagens',
          icon: MessageSquare,
          description: 'Conversas'
        },
        {
          name: 'Insights',
          href: '/empresa/insights',
          icon: BarChart3,
          description: 'Métricas da empresa'
        },
        {
          name: 'Perfil',
          href: '/empresa/perfil',
          icon: Building2,
          description: 'Perfil da empresa'
        }
      ]
    }

    // CANDIDATE role
    return [
      {
        name: 'Insights',
        href: '/candidato/insights',
        icon: BarChart3,
        description: 'Análises e estatísticas'
      },
      {
        name: 'Vagas',
        href: '/candidato/vagas',
        icon: Search,
        description: 'Buscar oportunidades'
      },
      {
        name: 'Candidaturas',
        href: '/candidato/candidaturas',
        icon: FileText,
        description: 'Minhas candidaturas'
      },
      {
        name: 'Academia',
        href: '/candidato/academia',
        icon: GraduationCap,
        description: 'Cursos e certificações'
      },
      {
        name: 'Certificados',
        href: '/candidato/certificados',
        icon: Award,
        description: 'Meus certificados'
      },
      {
        name: 'Perfil',
        href: '/candidato/perfil',
        icon: User,
        description: 'Meu perfil'
      }
    ]
  }

  const menuItems = customMenuItems || getMenuItems()

  const isActiveLink = (href: string) => {
    if (href === '/empresa') {
      return pathname === '/empresa'
    }
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const getRoleColor = () => {
    switch (session?.user?.role) {
      case 'ADMIN':
        return 'from-purple-500 to-indigo-600'
      case 'COMPANY':
        return 'from-blue-500 to-cyan-600'
      case 'CANDIDATE':
        return 'from-green-500 to-emerald-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getRoleLabel = () => {
    switch (session?.user?.role) {
      case 'ADMIN':
        return 'Administrador'
      case 'COMPANY':
        return 'Empresa'
      case 'CANDIDATE':
        return 'Candidato'
      default:
        return 'Usuário'
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 z-50 transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64' : 'w-16'
        } ${isMobile && !isExpanded ? '-translate-x-full' : 'translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {isExpanded && (
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRoleColor()} flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-lg">X</span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 truncate">Xpecial</h2>
                  <p className="text-xs text-gray-500 truncate">{getRoleLabel()}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isExpanded ? 'Recolher sidebar' : 'Expandir sidebar'}
            >
              {isExpanded ? (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* User Info */}
        {isExpanded && session?.user && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = 'isActive' in item && item.isActive !== undefined ? item.isActive : isActiveLink(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${getRoleColor()} text-white shadow-lg`
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={!isExpanded ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 ${isExpanded ? 'mr-3' : 'mx-auto'} ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                
                {isExpanded && (
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{item.name}</div>
                    {item.description && (
                      <div className={`text-xs truncate ${
                        isActive ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>


      </div>
    </>
  )
}