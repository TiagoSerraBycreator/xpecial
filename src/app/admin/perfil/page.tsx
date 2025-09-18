'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Eye, EyeOff, User, Lock } from 'lucide-react'
import Link from 'next/link'

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false
  }
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false
  }
  if (data.newPassword && data.newPassword.length < 6) {
    return false
  }
  return true
}, {
  message: "Senha atual é obrigatória para alterar senha, nova senha deve ter pelo menos 6 caracteres e senhas devem coincidir",
  path: ["newPassword"]
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function AdminProfile() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })

  const newPassword = watch('newPassword')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    // Preencher dados atuais
    setValue('name', session.user.name || '')
    setValue('email', session.user.email || '')
  }, [session, status, router, setValue])

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    setMessage(null)

    try {
      const updateData: any = {
        name: data.name,
        email: data.email
      }

      if (data.newPassword) {
        updateData.currentPassword = data.currentPassword
        updateData.newPassword = data.newPassword
      }

      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar perfil')
      }

      // Atualizar sessão
      await update({
        name: data.name,
        email: data.email
      })

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      
      // Limpar campos de senha
      setValue('currentPassword', '')
      setValue('newPassword', '')
      setValue('confirmPassword', '')
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erro ao atualizar perfil' 
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
          <p className="mt-2 text-gray-600">Atualize suas informações pessoais e senha</p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Message */}
            {message && (
              <div className={`p-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Informações Pessoais */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-medium text-gray-900">Informações Pessoais</h2>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Seu nome completo"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Alterar Senha */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Lock className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-medium text-gray-900">Alterar Senha</h2>
                <span className="text-sm text-gray-500">(opcional)</span>
              </div>

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    {...register('currentPassword')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite sua senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    {...register('newPassword')}
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite a nova senha"
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
              </div>

              {newPassword && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                </div>
              )}

              {errors.newPassword && (
                <p className="text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}