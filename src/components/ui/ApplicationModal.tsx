'use client'

import { useState } from 'react'
import { X, Send, AlertCircle } from 'lucide-react'

interface ApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { whatsapp: string; consent: boolean }) => void
  jobTitle: string
  companyName: string
  loading?: boolean
}

export default function ApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  jobTitle,
  companyName,
  loading = false
}: ApplicationModalProps) {
  const [whatsapp, setWhatsapp] = useState('')
  const [consent, setConsent] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errors, setErrors] = useState<{ whatsapp?: string; consent?: string }>({})

  const validateForm = () => {
    const newErrors: { whatsapp?: string; consent?: string } = {}

    // Validar WhatsApp
    if (!whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp é obrigatório'
    } else if (!/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(whatsapp.replace(/\s/g, ''))) {
      newErrors.whatsapp = 'Formato inválido. Use: (11) 99999-9999'
    }

    // Validar consentimento
    if (!consent) {
      newErrors.consent = 'Você deve concordar em liberar seus dados'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setShowConfirmation(true)
    }
  }

  const handleConfirm = () => {
    onSubmit({ whatsapp, consent })
    setShowConfirmation(false)
    handleClose()
  }

  const handleClose = () => {
    setWhatsapp('')
    setConsent(false)
    setShowConfirmation(false)
    setErrors({})
    onClose()
  }

  const formatWhatsApp = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value)
    setWhatsapp(formatted)
    if (errors.whatsapp) {
      setErrors(prev => ({ ...prev, whatsapp: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Candidatar-se à Vaga
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {!showConfirmation ? (
          /* Formulário */
          <form onSubmit={handleSubmit} className="p-6">
            {/* Informações da vaga */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-1">{jobTitle}</h3>
              <p className="text-blue-700 text-sm">{companyName}</p>
            </div>

            {/* Campo WhatsApp */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp para Contato *
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={handleWhatsAppChange}
                placeholder="(11) 99999-9999"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={15}
              />
              {errors.whatsapp && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.whatsapp}
                </p>
              )}
            </div>

            {/* Checkbox de consentimento */}
            <div className="mb-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked)
                    if (errors.consent) {
                      setErrors(prev => ({ ...prev, consent: undefined }))
                    }
                  }}
                  className={`mt-1 h-4 w-4 text-blue-600 border-2 rounded focus:ring-blue-500 ${
                    errors.consent ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="text-sm text-gray-700 leading-5">
                  Concordo em liberar meus dados pessoais e perfil profissional para que a empresa 
                  <strong> {companyName} </strong> possa avaliar minha candidatura para a vaga de 
                  <strong> {jobTitle}</strong>.
                </span>
              </label>
              {errors.consent && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.consent}
                </p>
              )}
            </div>

            {/* Botões */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Enviar Candidatura</span>
              </button>
            </div>
          </form>
        ) : (
          /* Confirmação */
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirmar Candidatura
              </h3>
              <p className="text-gray-600">
                Você deseja confirmar o envio da sua candidatura para participar da vaga 
                <strong> {jobTitle} </strong> na empresa <strong> {companyName}</strong>?
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600">
                <p><strong>WhatsApp:</strong> {whatsapp}</p>
                <p><strong>Consentimento:</strong> Dados liberados para a empresa</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Confirmar Envio</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}