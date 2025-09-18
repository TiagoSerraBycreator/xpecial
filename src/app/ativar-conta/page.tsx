'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Mail, Loader2, RefreshCw, Clock, AlertTriangle } from 'lucide-react'
import MainLayout from '@/components/layout/main-layout'

type VerificationStatus = 'loading' | 'success' | 'error' | 'already-verified' | 'expired' | 'invalid' | 'activation-failed'

export default function AtivarContaPage() {
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('invalid')
      setMessage('Token de verificação não encontrado')
      setDetails('O link de ativação está incompleto ou foi corrompido.')
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`)
      const data = await response.json()

      if (response.ok) {
        switch (data.status) {
          case 'success':
            setStatus('success')
            setMessage(data.message)
            setDetails(data.details)
            setUserName(data.userInfo?.name || '')
            setUserEmail(data.userInfo?.email || '')
            // Redirect to login after 5 seconds
            setTimeout(() => {
              router.push('/login?message=Conta ativada com sucesso! Faça login para continuar.')
            }, 5000)
            break
          case 'already_verified':
            setStatus('already-verified')
            setMessage(data.message)
            setDetails(data.details)
            break
          default:
            setStatus('success')
            setMessage(data.message)
            setDetails(data.details || '')
        }
      } else {
        switch (data.status) {
          case 'expired_token':
            setStatus('expired')
            setMessage(data.error)
            setDetails(data.details)
            setUserEmail(data.userEmail || '')
            break
          case 'invalid_token':
            setStatus('invalid')
            setMessage(data.error)
            setDetails(data.details)
            break
          case 'activation_failed':
            setStatus('activation-failed')
            setMessage(data.error)
            setDetails(data.details)
            break
          default:
            setStatus('error')
            setMessage(data.error || 'Erro ao verificar email')
            setDetails(data.details || 'Ocorreu um erro inesperado.')
        }
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erro de conexão')
      setDetails('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.')
    }
  }

  const resendVerificationEmail = async () => {
    if (!userEmail) {
      alert('Email não encontrado. Entre em contato com o administrador.')
      return
    }

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Email de verificação reenviado com sucesso! Verifique sua caixa de entrada.')
      } else {
        alert(data.error || 'Erro ao reenviar email. Entre em contato com o administrador.')
      }
    } catch (error) {
      alert('Erro de conexão. Tente novamente ou entre em contato com o administrador.')
    } finally {
      setIsResending(false)
    }
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          title: 'Conta Ativada com Sucesso!',
          showRedirect: true,
          showResend: false,
          showContact: false
        }
      case 'already-verified':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: CheckCircle,
          title: 'Conta Já Verificada',
          showRedirect: true,
          showResend: false,
          showContact: false
        }
      case 'expired':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: Clock,
          title: 'Link de Ativação Expirado',
          showRedirect: false,
          showResend: true,
          showContact: true
        }
      case 'invalid':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: XCircle,
          title: 'Link de Ativação Inválido',
          showRedirect: false,
          showResend: false,
          showContact: true
        }
      case 'activation-failed':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertTriangle,
          title: 'Falha na Ativação da Conta',
          showRedirect: false,
          showResend: false,
          showContact: true
        }
      case 'error':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: XCircle,
          title: 'Erro na Ativação',
          showRedirect: false,
          showResend: false,
          showContact: true
        }
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Loader2,
          title: 'Verificando...',
          showRedirect: false,
          showResend: false,
          showContact: false
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <StatusIcon className={`h-16 w-16 ${statusConfig.color} ${status === 'loading' ? 'animate-spin' : ''}`} />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {statusConfig.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg p-4`}>
              <p className={`text-sm ${statusConfig.color} text-center`}>
                {message}
              </p>
              {details && (
                <p className="text-xs text-gray-600 mt-2 text-center">
                  {details}
                </p>
              )}
            </div>

            {statusConfig.showRedirect && (
              <div className="text-center space-y-4">
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Ir para Login
                </Button>
              </div>
            )}

            {statusConfig.showResend && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email para reenvio
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email || userEmail}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <Button 
                  onClick={resendVerificationEmail}
                  disabled={isResending || (!email && !userEmail)}
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
            )}

            {statusConfig.showContact && (
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
            )}

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