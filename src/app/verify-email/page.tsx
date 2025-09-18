'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Mail, Loader2, RefreshCw } from 'lucide-react'
import MainLayout from '@/components/layout/main-layout'

type VerificationStatus = 'loading' | 'success' | 'error' | 'already-verified'

function VerifyEmailContent() {
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setMessage('Token de verificação não encontrado')
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`)
      const data = await response.json()

      if (response.ok) {
        if (data.verified) {
          setStatus('success')
          setMessage(data.message)
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?message=Conta ativada com sucesso! Faça login para continuar.')
          }, 3000)
        } else {
          setStatus('already-verified')
          setMessage(data.message)
        }
      } else {
        setStatus('error')
        setMessage(data.error || 'Erro ao verificar email')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erro de conexão. Tente novamente.')
    }
  }

  const resendVerificationEmail = async () => {
    if (!email) {
      alert('Por favor, digite seu email')
      return
    }

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Email de verificação reenviado com sucesso!')
      } else {
        alert(data.error || 'Erro ao reenviar email')
      }
    } catch (error) {
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setIsResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'already-verified':
        return <CheckCircle className="h-16 w-16 text-blue-500" />
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'already-verified':
        return 'text-blue-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verificação de Email
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className={`text-lg ${getStatusColor()}`}>
                {message}
              </p>
            </div>

            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    Sua conta foi ativada com sucesso! Você será redirecionado para a página de login em alguns segundos.
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Ir para Login
                </Button>
              </div>
            )}

            {status === 'already-verified' && (
              <div className="text-center space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    Sua conta já está ativa. Você pode fazer login normalmente.
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Ir para Login
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">
                    {message.includes('expirado') 
                      ? 'Seu token de verificação expirou. Solicite um novo email de verificação abaixo.'
                      : 'Ocorreu um erro na verificação. Tente solicitar um novo email de verificação.'
                    }
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email para reenvio
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Digite seu email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <Button 
                    onClick={resendVerificationEmail}
                    disabled={isResending || !email}
                    className="w-full"
                    variant="outline"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Reenviando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reenviar Email de Verificação
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Precisa de ajuda?{' '}
                <Link
                  href="/contato"
                  className="text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                >
                  Entre em contato
                </Link>
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
              >
                <Mail className="h-4 w-4" />
                Voltar ao Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Carregando...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}