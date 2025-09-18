'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, User, Mail, Shield, Eye, EyeOff } from 'lucide-react'
import { AdminPage, PageSection, ActionButton } from '@/components/ui/admin-page'
import { AdminCard } from '@/components/ui/admin-card'

const userEditSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'COMPANY', 'CANDIDATE']),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false
  }
  if (data.newPassword && data.newPassword.length < 6) {
    return false
  }
  return true
}, {
  message: "Nova senha deve ter pelo menos 6 caracteres e senhas devem coincidir",
  path: ["confirmPassword"]
})

type UserEditFormData = z.infer<typeof userEditSchema>

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'COMPANY' | 'CANDIDATE'
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
}

export default function EditUser({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const resolvedParams = use(params)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema)
  })

  const newPassword = watch('newPassword')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchUserDetails()
  }, [session, status, router, resolvedParams.id])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${resolvedParams.id}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        
        // Preencher o formulário
        setValue('name', userData.name)
        setValue('email', userData.email)
        setValue('role', userData.role)
        setValue('isActive', userData.isActive)
        setValue('isEmailVerified', userData.isEmailVerified)
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

  const onSubmit = async (data: UserEditFormData) => {
    setSaving(true)
    setMessage(null)

    try {
      const updateData: any = {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        isEmailVerified: data.isEmailVerified
      }

      if (data.newPassword) {
        updateData.password = data.newPassword
      }

      const response = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' })
        setTimeout(() => {
          router.push(`/admin/users/${resolvedParams.id}`)
        }, 2000)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Erro ao atualizar usuário' })
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      setMessage({ type: 'error', text: 'Erro ao atualizar usuário' })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <AdminPage title="Editar Usuário" subtitle="Carregando...">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Carregando dados do usuário...</p>
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
      title="Editar Usuário"
      subtitle={user.name}
      icon={User}
      actions={
        <>
          <ActionButton 
            variant="secondary" 
            icon={ArrowLeft}
            onClick={() => router.push(`/admin/users/${user.id}`)}
          >
            Cancelar
          </ActionButton>
          <ActionButton 
            variant="primary" 
            icon={Save}
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </ActionButton>
        </>
      }
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Usuários', href: '/admin/users' },
        { label: user.name, href: `/admin/users/${user.id}` },
        { label: 'Editar' }
      ]}
    >
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <PageSection title="Informações Básicas">
          <AdminCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome completo do usuário"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuário *
                </label>
                <select
                  {...register('role')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CANDIDATE">Candidato</option>
                  <option value="COMPANY">Empresa</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </div>
          </AdminCard>
        </PageSection>

        {/* Status do Usuário */}
        <PageSection title="Status do Usuário">
          <AdminCard>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Usuário ativo
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isEmailVerified')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Email verificado
                </label>
              </div>
            </div>
          </AdminCard>
        </PageSection>

        {/* Alterar Senha */}
        <PageSection title="Alterar Senha (Opcional)">
          <AdminCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    {...register('newPassword')}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Deixe em branco para manter a atual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                )}
              </div>

              {newPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirme a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              )}
            </div>
          </AdminCard>
        </PageSection>
      </form>
    </AdminPage>
  )
}