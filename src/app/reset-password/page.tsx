'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { FormGroup, Label, Input } from '@/components/ui/form'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!token) {
      setMessage('Token de redefinição não encontrado.')
    }
  }, [token])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !token) return

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage('Senha redefinida com sucesso! Você será redirecionado para o login.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setMessage(data.error || 'Erro ao redefinir senha')
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <MainLayout showNavigation={false}>
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Link Inválido
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                O link de redefinição de senha é inválido ou expirou.
              </p>
              <div className="space-y-4">
                <Button className="w-full">
                  <Link href="/forgot-password">
                    Solicitar Nova Redefinição
                  </Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <Link href="/login">
                    Voltar ao Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (isSuccess) {
    return (
      <MainLayout showNavigation={false}>
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Senha Redefinida!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <Button className="w-full">
                <Link href="/login">
                  Ir para Login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout showNavigation={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Lock className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Redefinir Senha
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Digite sua nova senha abaixo
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormGroup>
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    placeholder="Digite sua nova senha"
                    className="pr-10"
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-600 mt-1">
                    {errors.password}
                  </p>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    placeholder="Confirme sua nova senha"
                    className="pr-10"
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="text-sm text-red-600 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </FormGroup>

              {message && (
                <div className={`p-4 rounded-md ${
                  isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <p className="text-sm">{message}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                >
                  Voltar ao login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </MainLayout>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}