'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck, Filter, Trash2, RefreshCw } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import DashboardLayout from '@/components/layout/dashboard-layout';

type FilterType = 'all' | 'unread' | 'read';
type NotificationType = 'all' | 'info' | 'success' | 'warning' | 'error';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  } = useNotifications();

  const [filter, setFilter] = useState<FilterType>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = 
      filter === 'all' || 
      (filter === 'read' && notification.read) ||
      (filter === 'unread' && !notification.read);
    
    const matchesTypeFilter = 
      typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesReadFilter && matchesTypeFilter;
  });

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length > 0) {
      await markAsRead(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notificações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerencie suas notificações e mantenha-se atualizado
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshNotifications}
              disabled={isLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-red-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Não lidas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Check className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lidas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length - unreadCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-wrap items-center space-x-4">
              {/* Read Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todas</option>
                  <option value="unread">Não lidas</option>
                  <option value="read">Lidas</option>
                </select>
              </div>
              
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as NotificationType)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos os tipos</option>
                <option value="info">Informação</option>
                <option value="success">Sucesso</option>
                <option value="warning">Aviso</option>
                <option value="error">Erro</option>
              </select>
            </div>
            
            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedNotifications.length} selecionada{selectedNotifications.length > 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleMarkSelectedAsRead}
                  className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar como lidas
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Select All Header */}
          {filteredNotifications.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Selecionar todas ({filteredNotifications.length})
                </span>
              </label>
            </div>
          )}
          
          {/* Notifications */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Carregando notificações...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 dark:text-red-400 mb-2">Erro ao carregar notificações</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                <button
                  onClick={refreshNotifications}
                  className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Tentar novamente
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  {filter === 'unread' ? 'Nenhuma notificação não lida' : 
                   filter === 'read' ? 'Nenhuma notificação lida' : 
                   'Nenhuma notificação encontrada'}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {filter !== 'all' ? 'Tente alterar os filtros para ver mais notificações.' : 
                   'Você receberá notificações aqui quando houver atualizações.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                              getTypeColor(notification.type)
                            }`}>
                              {notification.type === 'info' ? 'Info' :
                               notification.type === 'success' ? 'Sucesso' :
                               notification.type === 'warning' ? 'Aviso' : 'Erro'}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {notification.time}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead([notification.id])}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Marcar como lida"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}