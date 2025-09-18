'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  time: string;
  user?: {
    name: string;
    email: string;
  };
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (page?: number, unreadOnly?: boolean) => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (
    page: number = 1,
    unreadOnly: boolean = false
  ) => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(unreadOnly && { unreadOnly: 'true' })
      });

      const response = await fetch(`/api/notifications?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar notificações');
      }

      const data: NotificationsResponse = await response.json();
      
      if (data && data.notifications) {
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (!session?.user?.id || notificationIds.length === 0) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar notificações como lidas');
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id)
            ? { ...notification, read: true }
            : notification
        )
      );

      // Atualizar contador de não lidas
      setUnreadCount(prev => {
        const markedCount = notificationIds.filter(id => 
          notifications.find(n => n.id === id && !n.read)
        ).length;
        return Math.max(0, prev - markedCount);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao marcar notificações como lidas:', err);
    }
  }, [session?.user?.id, notifications]);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter(notification => !notification.read)
      .map(notification => notification.id);
    
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  }, [notifications, markAsRead]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications(1, false);
  }, [fetchNotifications]);

  // Buscar notificações iniciais
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id, fetchNotifications]);

  // Polling para atualizações em tempo real (a cada 30 segundos)
  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(() => {
      fetchNotifications(1, false);
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [session?.user?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
}

// Hook para criar notificações (apenas para admins)
export function useCreateNotification() {
  const { data: session } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNotification = useCallback(async (data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    userId?: string;
    role?: 'ADMIN' | 'COMPANY' | 'CANDIDATE';
  }) => {
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      throw new Error('Não autorizado');
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar notificação');
      }

      const result = await response.json();
      return result.notification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [session?.user?.id, session?.user?.role]);

  return {
    createNotification,
    isCreating,
    error,
  };
}