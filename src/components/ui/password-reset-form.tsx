'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface PasswordResetFormProps {
  onSubmit: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  loading?: boolean;
}

export default function PasswordResetForm({ onSubmit, loading = false }: PasswordResetFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'A nova senha deve ser diferente da atual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center mb-6">
        <Lock className="h-5 w-5 text-gray-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Alterar Senha</h3>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">Senha alterada com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Senha Atual */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Senha Atual
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                errors.currentPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Digite sua senha atual"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={loading}
            >
              {showPasswords.current ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <div className="mt-1 flex items-center text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.currentPassword}
            </div>
          )}
        </div>

        {/* Nova Senha */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Nova Senha
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                errors.newPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Digite sua nova senha"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={loading}
            >
              {showPasswords.new ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <div className="mt-1 flex items-center text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.newPassword}
            </div>
          )}
        </div>

        {/* Confirmar Nova Senha */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar Nova Senha
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Confirme sua nova senha"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={loading}
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="mt-1 flex items-center text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.confirmPassword}
            </div>
          )}
        </div>

        {/* Botão de Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Alterando...
              </>
            ) : (
              'Alterar Senha'
            )}
          </button>
        </div>
      </form>

      {/* Dicas de Segurança */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Dicas de Segurança:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Use pelo menos 6 caracteres</li>
          <li>• Combine letras maiúsculas e minúsculas</li>
          <li>• Inclua números e símbolos</li>
          <li>• Evite informações pessoais óbvias</li>
        </ul>
      </div>
    </div>
  );
}