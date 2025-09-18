'use client';

import { Construction, FileText, Shield, Clock } from 'lucide-react';

export default function CertificadosPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Certificados
          </h1>
          <p className="text-gray-600">
            Validação e gerenciamento de certificados dos candidatos
          </p>
        </div>

        {/* Em Construção Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Construction className="h-24 w-24 text-orange-500" />
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                <Clock className="h-4 w-4 text-yellow-800" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Página em Construção
          </h2>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Estamos trabalhando para trazer a melhor experiência de validação e 
            gerenciamento de certificados. Esta funcionalidade estará disponível em breve.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Validação de Certificados
              </h3>
              <p className="text-sm text-gray-600">
                Sistema completo para validar autenticidade dos certificados
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Verificação de Segurança
              </h3>
              <p className="text-sm text-gray-600">
                Controles de segurança avançados para prevenir fraudes
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <Construction className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Relatórios Detalhados
              </h3>
              <p className="text-sm text-gray-600">
                Análises e relatórios sobre certificações dos candidatos
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-orange-800 font-medium">
                Previsão de lançamento: Próximas semanas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}