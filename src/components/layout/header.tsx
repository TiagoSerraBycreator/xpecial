'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Edit,
  Shield,
  Building2,
  Briefcase,
  Sun,
  Moon,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { useLogoutModal } from '@/components/ui/logout-modal';
import { useNotifications } from '@/hooks/useNotifications';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarExpanded?: boolean;
  className?: string;
}

export default function Header({ onToggleSidebar, sidebarExpanded = true, className = '' }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  const { isOpen: showLogoutModal, openModal: openLogoutModal, closeModal: closeLogoutModal, LogoutModal } = useLogoutModal();
  const { 
    notifications, 
    unreadCount, 
    isLoading: notificationsLoading, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications 
  } = useNotifications();

  // Fetch user profile photo
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!session?.user?.id || !session?.user?.role) return;

      try {
        let endpoint = '';
        if (session.user.role === 'CANDIDATE') {
          endpoint = '/api/candidate/profile';
        } else if (session.user.role === 'COMPANY') {
          endpoint = '/api/company/profile';
        } else {
          return; // Admin doesn't have profile photo for now
        }

        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          if (session.user.role === 'CANDIDATE') {
            setProfilePhoto(data.profilePhoto || null);
          } else if (session.user.role === 'COMPANY') {
            setProfilePhoto(data.logo || null);
          }
        }
      } catch (error) {
        console.error('Error fetching profile photo:', error);
      }
    };

    fetchProfilePhoto();
  }, [session?.user?.id, session?.user?.role]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Get user role color
  const getRoleColor = () => {
    switch (session?.user?.role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPANY':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANDIDATE':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get user role label
  const getRoleLabel = () => {
    switch (session?.user?.role) {
      case 'ADMIN':
        return 'Admin';
      case 'COMPANY':
        return 'Empresa';
      case 'CANDIDATE':
        return 'Candidato';
      default:
        return 'Usuário';
    }
  };

  // Get profile link based on role
  const getProfileLink = () => {
    switch (session?.user?.role) {
      case 'ADMIN':
        return '/admin/perfil';
      case 'COMPANY':
        return '/empresa/perfil';
      case 'CANDIDATE':
        return '/candidato/perfil';
      default:
        return '/perfil';
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!session?.user?.name) return 'U';
    const names = session.user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  // Avatar component
  const Avatar = ({ size = 'w-8 h-8' }: { size?: string }) => {
    if (profilePhoto) {
      return (
        <img
          src={profilePhoto}
          alt="Profile"
          className={`${size} rounded-full object-cover border-2 border-gray-200`}
        />
      );
    }
    
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold`}>
        {getUserInitials()}
      </div>
    );
  };

  return (
    <>
      <header className={`bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm ${className}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              {isMobile && (
                <button
                  onClick={onToggleSidebar}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              )}

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="hidden sm:block">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar vagas, empresas..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  />
                </div>
              </form>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Button */}
              {isMobile && (
                <button
                  onClick={() => {/* TODO: Implement mobile search modal */}}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Help Button */}
              <button
                onClick={() => router.push('/ajuda')}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Help"
              >
                <HelpCircle className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsProfileOpen(false);
                  }}
                  className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Marcar todas como lidas
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead([notification.id])}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>Nenhuma notificação</p>
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 5 && (
                      <div className="p-4 border-t border-gray-200">
                        <button
                          onClick={() => router.push('/notificacoes')}
                          className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver todas as notificações
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile */}
              {session?.user && (
                <div className="relative dropdown-container">
                  <button
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsNotificationsOpen(false);
                    }}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                  >
                    <Avatar />
                    {!isMobile && (
                      <>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                            {session.user.name}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor()}`}>
                            {getRoleLabel()}
                          </span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      </>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <Avatar size="w-10 h-10" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {session.user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {session.user.email}
                            </p>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border mt-1 ${getRoleColor()}`}>
                              {getRoleLabel()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <button
                          onClick={() => {
                            router.push(getProfileLink());
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-3 text-gray-500" />
                          Editar Perfil
                        </button>
                        


                        {session.user.role === 'ADMIN' && (
                          <button
                            onClick={() => {
                              router.push('/admin');
                              setIsProfileOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Shield className="h-4 w-4 mr-3 text-gray-500" />
                            Painel Admin
                          </button>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-200 py-2">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            openLogoutModal();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Modal */}
      <LogoutModal />
    </>
  );
}