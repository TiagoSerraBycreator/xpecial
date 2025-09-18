'use client';

import { useState } from 'react';
import { 
  Shield, 
  ShieldOff, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Power,
  PowerOff
} from 'lucide-react';

interface AccountActivityProps {
  isActive: boolean;
  onActivateAccount: () => Promise<void>;
  onDeactivateAccount: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  loading?: boolean;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmButtonClass: string;
  icon: React.ReactNode;
  loading?: boolean;
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmButtonClass,
  icon,
  loading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon}
            <h3 className="text-lg font-semibold text-gray-900 ml-2">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center ${confirmButtonClass}`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountActivity({
  isActive,
  onActivateAccount,
  onDeactivateAccount,
  onDeleteAccount,
  loading = false
}: AccountActivityProps) {
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleActivate = async () => {
    setActionLoading(true);
    try {
      await onActivateAccount();
      setSuccess('Conta ativada com sucesso!');
      setShowActivateModal(false);
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Erro ao ativar conta:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setActionLoading(true);
    try {
      await onDeactivateAccount();
      setSuccess('Conta desativada com sucesso!');
      setShowDeactivateModal(false);
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Erro ao desativar conta:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await onDeleteAccount();
      setSuccess('Conta excluída com sucesso!');
      setShowDeleteModal(false);
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center mb-6">
        <Shield className="h-5 w-5 text-gray-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Atividade da Conta</h3>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Status da Conta */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isActive ? (
              <Power className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <PowerOff className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span className="font-medium text-gray-900">
              Status da Conta: 
              <span className={`ml-2 ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                {isActive ? 'Ativa' : 'Inativa'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Ações da Conta */}
      <div className="space-y-4">
        {/* Ativar/Desativar Conta */}
        {isActive ? (
          <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center">
              <ShieldOff className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Desativar Conta</h4>
                <p className="text-sm text-gray-600">Sua conta ficará temporariamente inativa</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeactivateModal(true)}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              Desativar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Ativar Conta</h4>
                <p className="text-sm text-gray-600">Reativar sua conta para usar a plataforma</p>
              </div>
            </div>
            <button
              onClick={() => setShowActivateModal(true)}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Ativar
            </button>
          </div>
        )}

        {/* Excluir Conta */}
        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center">
            <Trash2 className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Excluir Conta</h4>
              <p className="text-sm text-gray-600">Esta ação é irreversível e apagará todos os seus dados</p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>

      {/* Modais de Confirmação */}
      <ConfirmationModal
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onConfirm={handleActivate}
        title="Ativar Conta"
        message="Tem certeza que deseja ativar sua conta? Você poderá usar todas as funcionalidades da plataforma novamente."
        confirmText="Ativar Conta"
        confirmButtonClass="bg-green-600 hover:bg-green-700 disabled:opacity-50"
        icon={<Shield className="h-5 w-5 text-green-600" />}
        loading={actionLoading}
      />

      <ConfirmationModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivate}
        title="Desativar Conta"
        message="Tem certeza que deseja desativar sua conta? Você não poderá acessar a plataforma até reativá-la."
        confirmText="Desativar"
        confirmButtonClass="bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
        icon={<ShieldOff className="h-5 w-5 text-orange-600" />}
        loading={actionLoading}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Conta"
        message="⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL! Todos os seus dados, candidaturas, mensagens e informações serão permanentemente apagados. Tem certeza absoluta que deseja continuar?"
        confirmText="Excluir Permanentemente"
        confirmButtonClass="bg-red-600 hover:bg-red-700 disabled:opacity-50"
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        loading={actionLoading}
      />
    </div>
  );
}