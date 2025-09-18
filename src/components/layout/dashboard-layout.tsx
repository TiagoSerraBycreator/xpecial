'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from './sidebar';
import Header from './header';
import { Toaster } from 'react-hot-toast';

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  description: string;
  isActive?: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  menuItems?: MenuItem[];
  userRole?: string;
  headerTitle?: string;
  headerSubtitle?: string;
}

export default function DashboardLayout({ 
  children, 
  className = '', 
  menuItems,
  userRole,
  headerTitle,
  headerSubtitle 
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-collapse sidebar on mobile
      if (mobile) {
        setSidebarExpanded(false);
        setSidebarOpen(false);
      } else {
        setSidebarExpanded(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle authentication
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const target = event.target as Element;
        const sidebar = document.getElementById('mobile-sidebar');
        const toggleButton = document.querySelector('[aria-label="Toggle menu"]');
        
        if (sidebar && !sidebar.contains(target) && !toggleButton?.contains(target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarExpanded(!sidebarExpanded);
    }
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isExpanded={sidebarExpanded}
        setIsExpanded={setSidebarExpanded}
        customMenuItems={menuItems}
      />

      {/* Main Content Area */}
      <div className={`flex flex-col transition-all duration-300 ease-in-out ${
        isMobile 
          ? 'ml-0' 
          : sidebarExpanded 
            ? 'ml-64' 
            : 'ml-16'
      }`}>
        {/* Header */}
        <Header
          onToggleSidebar={handleToggleSidebar}
          sidebarExpanded={sidebarExpanded}
          className="sticky top-0 z-30"
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Content Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[calc(100vh-12rem)]">
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="text-sm text-gray-600">
                © 2024 Xpecial. Todos os direitos reservados.
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <button 
                  onClick={() => router.push('/termos')}
                  className="hover:text-gray-900 transition-colors"
                >
                  Termos de Uso
                </button>
                <button 
                  onClick={() => router.push('/privacidade')}
                  className="hover:text-gray-900 transition-colors"
                >
                  Privacidade
                </button>
                <button 
                  onClick={() => router.push('/suporte')}
                  className="hover:text-gray-900 transition-colors"
                >
                  Suporte
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}

// Scroll to Top Button Component
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110"
      aria-label="Scroll to top"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}