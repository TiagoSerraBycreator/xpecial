'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { FormGroup, Label, Input } from '@/components/ui/form'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage(data.message)
      } else {
        setMessage(data.error || 'Erro ao enviar email de redefinição')
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Email Enviado!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Não recebeu o email? Verifique sua caixa de spam ou tente novamente.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setIsSuccess(false)
                      setEmail('')
                      setMessage('')
                    }}
                  >
                    Tentar Novamente
                  </Button>
                  <Button className="flex-1">
                    <Link href="/login">
                      Voltar ao Login
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Image
                src="/logo.svg"
                alt="Xpecial"
                width={40}
                height={40}
                className="filter brightness-0 invert"
              />
            </div>
          </div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-white mb-2">Xpecial</h1>
            <CardTitle className="text-xl font-semibold text-white">
              Esqueceu sua senha?
            </CardTitle>
          </div>
          <p className="text-gray-800 mt-2 font-medium">
            Digite seu email e enviaremos instruções para redefinir sua senha
          </p>
        </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  placeholder="Digite seu email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  autoComplete="email"
                  autoFocus
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600 mt-1">
                    {errors.email}
                  </p>
                )}
              </FormGroup>

              {message && !isSuccess && (
                <div className="p-4 rounded-md bg-red-50 text-red-700">
                  <p className="text-sm">{message}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar Instruções'}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Voltar ao login
                </Link>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link
                    href="/cadastro"
                    className="text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                  >
                    Cadastre-se aqui
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
}