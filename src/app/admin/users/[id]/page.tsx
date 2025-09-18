'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, User, Mail, Calendar, Shield, Building2, Phone, MapPin, FileText, Eye, Edit, UserX, Trash2 } from 'lucide-react'
import { AdminPage, PageSection, ActionButton } from '@/components/ui/admin-page'
import { AdminCard } from '@/components/ui/admin-card'

interface UserDetails {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'COMPANY' | 'CANDIDATE'
  isActive: boolean
  createdAt: string
  candidate?: {
    id: string
    phone?: string
    city?: string
    state?: string
    dateOfBirth?: string
    description?: string
    disabilities?: string[]
    skills?: string[]
    languages?: string[]
    experience?: string
    education?: string
  }
  company?: {
    id: string
    cnpj?: string
    description?: string
    website?: string
    sector?: string
    foundedYear?: number
    employeeCount?: string
  }
}

export default function UserDetails({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setUserId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (status === 'loading' || !userId) return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchUserDetails()
  }, [session, status, router, userId])

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        console.error('Erro ao carregar detalhes do usuário')
        router.push('/admin/users')
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do usuário:', error)
      router.push('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async () => {
    if (!user || user.role === 'ADMIN') return

    try {
      const newStatus = !user.isActive
      const response = await fetch(`/api/admin/users/${user.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: newStatus
        })
      })

      if (response.ok) {
        setUser(prev => prev ? { ...prev, isActive: newStatus } : null)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erro ao alterar status do usuário')
      }
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error)
      alert('Erro ao alterar status do usuário')
    }
  }

  const handleDeleteUser = async () => {
    if (!user || user.role === 'ADMIN') return
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/users')
      } else {
        alert('Erro ao excluir usuário')
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro ao excluir usuário')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador'
      case 'COMPANY': return 'Empresa'
      case 'CANDIDATE': return 'Candidato'
      default: return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800'
      case 'COMPANY': return 'bg-blue-100 text-blue-800'
      case 'CANDIDATE': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <AdminPage title="Detalhes do Usuário" subtitle="Carregando...">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Carregando detalhes do usuário...</p>
          </div>
        </div>
      </AdminPage>
    )
  }

  if (!user) {
    return (
      <AdminPage title="Usuário não encontrado" subtitle="O usuário solicitado não foi encontrado">
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Usuário não encontrado</p>
          <p className="text-gray-400 text-sm mt-2">O usuário que você está procurando não existe ou foi removido</p>
          <ActionButton 
            variant="primary" 
            icon={ArrowLeft}
            onClick={() => router.push('/admin/users')}
            className="mt-4"
          >
            Voltar para Usuários
          </ActionButton>
        </div>
      </AdminPage>
    )
  }

  return (
    <AdminPage 
      title={`Detalhes do Usuário`}
      subtitle={user.name}
      icon={User}
      actions={
        <>
          <ActionButton 
            variant="secondary" 
            icon={ArrowLeft}
            onClick={() => router.push('/admin/users')}
          >
            Voltar
          </ActionButton>
          <ActionButton 
            variant="secondary" 
            icon={Edit}
            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
          >
            Editar
          </ActionButton>
          {user.role !== 'ADMIN' && (
            <>
              <ActionButton 
                variant={user.isActive ? "secondary" : "success"}
                icon={UserX}
                onClick={handleToggleUserStatus}
              >
                {user.isActive ? 'Desabilitar' : 'Habilitar'}
              </ActionButton>
              <ActionButton 
                variant="danger" 
                icon={Trash2}
                onClick={handleDeleteUser}
              >
                Excluir
              </ActionButton>
            </>
          )}
        </>
      }
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Usuários', href: '/admin/users' },
        { label: user.name }
      ]}
    >
      {/* Informações Básicas */}
      <PageSection title="Informações Básicas">
        <AdminCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900 font-medium">{user.name}</p>
                  {!user.isActive && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Inativo
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  {user.email}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Usuário
                </label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                  <Shield className="h-4 w-4 mr-1" />
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Cadastro
                </label>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  {formatDate(user.createdAt)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID do Usuário
                </label>
                <p className="text-gray-600 font-mono text-sm">{user.id}</p>
              </div>
            </div>
          </div>
        </AdminCard>
      </PageSection>

      {/* Informações Específicas do Candidato */}
      {user.role === 'CANDIDATE' && user.candidate && (
        <PageSection title="Informações do Candidato">
          <AdminCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {user.candidate.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {user.candidate.phone}
                    </p>
                  </div>
                )}
                
                {(user.candidate.city || user.candidate.state) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Localização
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {[user.candidate.city, user.candidate.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
                
                {user.candidate.dateOfBirth && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(user.candidate.dateOfBirth).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {user.candidate.skills && user.candidate.skills.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Habilidades
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {user.candidate.skills.map((skill, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {user.candidate.languages && user.candidate.languages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idiomas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {user.candidate.languages.map((language, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {user.candidate.disabilities && user.candidate.disabilities.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deficiências
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {user.candidate.disabilities.map((disability, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-purple-100 text-purple-800">
                          {disability}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {user.candidate.description && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{user.candidate.description}</p>
              </div>
            )}
            
            {user.candidate.experience && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiência
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{user.candidate.experience}</p>
              </div>
            )}
            
            {user.candidate.education && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Educação
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{user.candidate.education}</p>
              </div>
            )}
          </AdminCard>
        </PageSection>
      )}

      {/* Informações Específicas da Empresa */}
      {user.role === 'COMPANY' && user.company && (
        <PageSection title="Informações da Empresa">
          <AdminCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {user.company.cnpj && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CNPJ
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      {user.company.cnpj}
                    </p>
                  </div>
                )}
                
                {user.company.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <a 
                      href={user.company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      {user.company.website}
                    </a>
                  </div>
                )}
                
                {user.company.sector && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Setor
                    </label>
                    <p className="text-gray-900">{user.company.sector}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {user.company.foundedYear && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ano de Fundação
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {user.company.foundedYear}
                    </p>
                  </div>
                )}
                
                {user.company.employeeCount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Funcionários
                    </label>
                    <p className="text-gray-900">{user.company.employeeCount}</p>
                  </div>
                )}
              </div>
            </div>
            
            {user.company.description && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição da Empresa
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{user.company.description}</p>
              </div>
            )}
          </AdminCard>
        </PageSection>
      )}
    </AdminPage>
  )
}