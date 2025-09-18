'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/ui/navigation';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  showNavigation?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

export default function MainLayout({ 
  children, 
  className = '', 
  showNavigation = true,
  maxWidth = '7xl'
}: MainLayoutProps) {
  const { data: session } = useSession();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '7xl': return 'max-w-7xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-7xl';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Pular para o conteúdo principal
      </a>

      {/* Navigation */}
      {showNavigation && <Navigation />}

      {/* Main Content */}
      <main 
        id="main-content"
        className="flex-1 focus:outline-none"
        tabIndex={-1}
        role="main"
        aria-label="Conteúdo principal"
      >
        <div className={`${getMaxWidthClass()} mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Xpecial</h3>
              <p className="text-gray-600 mb-4">
                Portal de vagas inclusivas e cursos online para pessoas com deficiência. 
                Conectamos talentos únicos com oportunidades especiais.
              </p>
              <p className="text-sm text-gray-500">
                © 2024 Xpecial. Todos os direitos reservados.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/validar-certificado" 
                    className="text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                  >
                    Validar Certificado
                  </a>
                </li>
                {!session && (
                  <>
                    <li>
                      <a 
                        href="/cadastro" 
                        className="text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                      >
                        Cadastrar-se
                      </a>
                    </li>
                    <li>
                      <a 
                        href="/login" 
                        className="text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                      >
                        Entrar
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-600">
                <li>contato@xpecial.com</li>
                <li>(11) 9999-9999</li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
          </div>

          {/* Accessibility Statement */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-gray-500 mb-4 sm:mb-0">
                Comprometidos com a acessibilidade digital. 
                <a 
                  href="mailto:acessibilidade@xpecial.com" 
                  className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md ml-1"
                >
                  Relate problemas de acessibilidade
                </a>
              </p>
              <div className="flex space-x-4 text-sm text-gray-500">
                <a 
                  href="#" 
                  className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                >
                  Política de Privacidade
                </a>
                <a 
                  href="#" 
                  className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                >
                  Termos de Uso
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 z-50"
          aria-label="Voltar ao topo da página"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}