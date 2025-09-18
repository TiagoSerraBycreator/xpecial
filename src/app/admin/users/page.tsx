'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, Filter, MoreVertical, Edit, Trash2, Eye, ArrowLeft, Users, Plus, UserX, UserCheck, Mail, MailCheck, Power, PowerOff, AlertTriangle } from 'lucide-react'
import { AdminPage, PageSection, CardGrid, ActionButton } from '@/components/ui/admin-page'
import { AdminCard } from '@/components/ui/admin-card'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'COMPANY' | 'CANDIDATE'
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  candidate?: {
    id: string
    phone?: string
    disabilities?: string[]
  }
  company?: {
    id: string
    cnpj?: string
    description?: string
  }
}

export default function UsersManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null
  })
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const usersPerPage = 10

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchUsers()
  }, [session, status, router, currentPage, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        search: searchTerm,
        role: roleFilter
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.users) {
          setUsers(data.users)
          setTotalPages(Math.ceil(data.total / usersPerPage))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }



  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: newStatus
        })
      })

      if (response.ok) {
        // Atualizar o estado local
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, isActive: newStatus }
            : user
        ))
      } else {
        const errorData = await response.json()
        console.error('Erro ao alterar status do usuário:', errorData.error)
        alert(errorData.error || 'Erro ao alterar status do usuário')
      }
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error)
      alert('Erro ao alterar status do usuário')
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${deleteModal.user.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remover usuário da lista local
        setUsers(users.filter(user => user.id !== deleteModal.user!.id))
        setDeleteModal({ isOpen: false, user: null })
      } else {
        const errorData = await response.json()
        console.error('Erro ao deletar usuário:', errorData.error)
        alert('Erro ao deletar usuário: ' + errorData.error)
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      alert('Erro ao deletar usuário')
    } finally {
      setDeleting(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: 'bg-purple-100 text-purple-800',
      COMPANY: 'bg-blue-100 text-blue-800',
      CANDIDATE: 'bg-green-100 text-green-800'
    }
    
    const labels = {
      ADMIN: 'Administrador',
      COMPANY: 'Empresa',
      CANDIDATE: 'Candidato'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <AdminPage title="Usuários" subtitle="Carregando...">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Carregando usuários...</p>
          </div>
        </div>
      </AdminPage>
    )
  }

  return (
    <AdminPage 
      title="Gerenciamento de Usuários" 
      subtitle="Gerencie todos os usuários da plataforma"
      icon={Users}
      actions={
        <>
          <ActionButton variant="secondary" icon={Filter}>
            Filtros
          </ActionButton>
          <ActionButton variant="primary" icon={Plus}>
            Novo Usuário
          </ActionButton>
        </>
      }
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Usuários' }
      ]}
    >
        <PageSection title="Filtros">
          <AdminCard>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="ALL">Todos os tipos</option>
                  <option value="CANDIDATE">Candidatos</option>
                  <option value="COMPANY">Empresas</option>
                  <option value="ADMIN">Administradores</option>
                </select>
              </div>
            </div>
          </AdminCard>
        </PageSection>

        <PageSection title="Lista de Usuários">
          <AdminCard>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Data de Cadastro
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Informações Adicionais
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 ${
                    !user.isActive ? 'bg-gray-100 opacity-75' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          {!user.isActive && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Inativo
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {user.isEmailVerified ? (
                            <MailCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <Mail className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-xs font-medium ${
                            user.isEmailVerified ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {user.isEmailVerified ? 'Verificado' : 'Não verificado'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors hover:bg-gray-100 ${
                            user.isActive ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
                          }`}
                          title={user.isActive ? 'Clique para desativar' : 'Clique para ativar'}
                        >
                          {user.isActive ? (
                            <Power className="h-4 w-4" />
                          ) : (
                            <PowerOff className="h-4 w-4" />
                          )}
                          <span className="text-xs font-medium">
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role === 'CANDIDATE' && user.candidate && (
                        <div>
                          {user.candidate.phone && <div>Tel: {user.candidate.phone}</div>}
                          {user.candidate.disabilities && user.candidate.disabilities.length > 0 && (
                            <div>Deficiências: {user.candidate.disabilities.length}</div>
                          )}
                        </div>
                      )}
                      {user.role === 'COMPANY' && user.company && (
                        <div>
                          {user.company.cnpj && <div>CNPJ: {user.company.cnpj}</div>}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          aria-label="Visualizar usuário"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          aria-label="Editar usuário"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {user.role !== 'ADMIN' && (
                          <>
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              className={`p-1 rounded transition-colors ${
                                user.isActive 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              aria-label={user.isActive ? 'Desabilitar usuário' : 'Habilitar usuário'}
                            >
                              {user.isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, user })}
                              className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                              aria-label="Excluir usuário"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <ActionButton
                    variant="secondary"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </ActionButton>
                  <ActionButton
                    variant="secondary"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próximo
                  </ActionButton>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando página <span className="font-semibold">{currentPage}</span> de{' '}
                      <span className="font-semibold">{totalPages}</span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <ActionButton
                      variant="secondary"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </ActionButton>
                    <ActionButton
                      variant="secondary"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próximo
                    </ActionButton>
                  </div>
                </div>
              </div>
            )}
          </AdminCard>
        </PageSection>

        {users.length === 0 && (
          <PageSection title="Nenhum resultado">
            <AdminCard>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Nenhum usuário encontrado</p>
                <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros ou criar um novo usuário</p>
              </div>
            </AdminCard>
          </PageSection>
        )}

        {/* Modal de confirmação de exclusão */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Exclusão
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir o usuário{' '}
                <span className="font-semibold">{deleteModal.user?.name}</span>?
                <br />
                <span className="text-sm text-red-600 mt-2 block">
                  Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.
                </span>
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, user: null })}
                  disabled={deleting}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Excluindo...
                    </>
                  ) : (
                    'Excluir'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </AdminPage>
  )
}