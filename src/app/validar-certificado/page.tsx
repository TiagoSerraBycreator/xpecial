'use client';

import { useState } from 'react';
import { Search, CheckCircle, XCircle, FileText, Calendar, User, Mail, Clock, Award, Tag } from 'lucide-react';

interface Certificate {
  id: string;
  certificateNumber: string;
  issuedAt: string;
  candidate: {
    name: string;
    email: string;
  };
  course: {
    title: string;
    description: string;
    duration: number;
    difficulty: string;
    category: string;
  };
}

interface ValidationResult {
  valid: boolean;
  message?: string;
  certificate?: Certificate;
}

export default function ValidateCertificate() {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validateCertificate = async () => {
    if (!certificateNumber.trim()) {
      alert('Por favor, insira o número do certificado');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/certificates/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ certificateNumber: certificateNumber.trim() }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erro ao validar certificado:', error);
      setResult({
        valid: false,
        message: 'Erro ao validar certificado. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'text-green-600 bg-green-100';
      case 'INTERMEDIATE': return 'text-yellow-600 bg-yellow-100';
      case 'ADVANCED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'Iniciante';
      case 'INTERMEDIATE': return 'Intermediário';
      case 'ADVANCED': return 'Avançado';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Validação de Certificado
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Verifique a autenticidade de um certificado inserindo o número do certificado abaixo.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="certificate-number" className="block text-sm font-medium text-gray-700 mb-2">
                Número do Certificado
              </label>
              <input
                type="text"
                id="certificate-number"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                placeholder="Ex: CERT-1234567890-123-456"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && validateCertificate()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={validateCertificate}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {loading ? 'Validando...' : 'Validar'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {result.valid ? (
              <div>
                {/* Valid Certificate Header */}
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-green-600">Certificado Válido</h2>
                    <p className="text-gray-600">Este certificado é autêntico e foi emitido pela plataforma.</p>
                  </div>
                </div>

                {/* Certificate Details */}
                {result.certificate && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Candidate Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informações do Candidato
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{result.certificate.candidate.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">{result.certificate.candidate.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Informações do Curso
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{result.certificate.course.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{result.certificate.course.description}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{result.certificate.course.duration}h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4 text-gray-500" />
                            <span>{result.certificate.course.category}</span>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            getDifficultyColor(result.certificate.course.difficulty)
                          }`}>
                            {getDifficultyText(result.certificate.course.difficulty)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Info */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Detalhes do Certificado
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Número do Certificado:</span>
                            <p className="text-gray-900 font-mono text-sm">{result.certificate.certificateNumber}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Data de Emissão:</span>
                            <p className="text-gray-900 flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(result.certificate.issuedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">Certificado Inválido</h2>
                <p className="text-gray-600">
                  {result.message || 'O certificado não foi encontrado ou é inválido.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Como funciona a validação?</h3>
          <div className="space-y-2 text-blue-800">
            <p>• Cada certificado possui um número único gerado automaticamente</p>
            <p>• Os certificados são armazenados de forma segura em nossa base de dados</p>
            <p>• A validação verifica a autenticidade e exibe informações detalhadas</p>
            <p>• Certificados válidos mostram dados do candidato, curso e data de emissão</p>
          </div>
        </div>
      </div>
    </div>
  );
}