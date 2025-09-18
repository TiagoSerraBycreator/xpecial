'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
  title?: string;
  message?: string;
  className?: string;
}

export default function LogoutModal({
  isOpen,
  onClose,
  redirectUrl = '/login',
  title = 'Confirmar Logout',
  message = 'Tem certeza que deseja sair da sua conta?',
  className = ''
}: LogoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({ callbackUrl: redirectUrl });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-50"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto transform transition-all ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
          aria-describedby="logout-modal-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 
                id="logout-modal-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h3>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p 
              id="logout-modal-description"
              className="text-gray-600 dark:text-gray-300 mb-6"
            >
              {message}
            </p>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              <p>• Você será redirecionado para a página de login</p>
              <p>• Suas configurações e preferências serão mantidas</p>
              <p>• Você pode fazer login novamente a qualquer momento</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saindo...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook personalizado para usar o modal de logout
export function useLogoutModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
    LogoutModal: (props: Omit<LogoutModalProps, 'isOpen' | 'onClose'>) => (
      <LogoutModal
        {...props}
        isOpen={isOpen}
        onClose={closeModal}
      />
    )
  };
}