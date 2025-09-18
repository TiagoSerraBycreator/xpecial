'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Mapeamento de rotas para labels mais amigáveis
const routeLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'vagas': 'Vagas',
  'candidatos': 'Candidatos',
  'empresas': 'Empresas',
  'cursos': 'Cursos',
  'perfil': 'Perfil',
  'configuracoes': 'Configurações',
  'notificacoes': 'Notificações',
  'relatorios': 'Relatórios',
  'admin': 'Administração',
  'empresa': 'Empresa',
  'candidato': 'Candidato',
  'auth': 'Autenticação',
  'signin': 'Entrar',
  'signup': 'Cadastrar',
  'forgot-password': 'Recuperar Senha',
  'nova': 'Nova',
  'editar': 'Editar',
  'detalhes': 'Detalhes',
  'aplicacoes': 'Aplicações',
  'favoritas': 'Favoritas',
  'publicadas': 'Publicadas',
  'ativas': 'Ativas',
  'inativas': 'Inativas',
};

// Função para gerar breadcrumbs automaticamente baseado na URL
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Início',
      href: '/',
      icon: Home,
    },
  ];

  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Pular segmentos que são IDs (números ou UUIDs)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) || 
        /^\d+$/.test(segment)) {
      return;
    }
    
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Se é o último segmento, não adiciona href (página atual)
    const isLast = index === segments.length - 1;
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });

  return breadcrumbs;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Se items não foram fornecidos, gera automaticamente baseado na URL
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);
  
  // Não mostrar breadcrumbs na página inicial
  if (pathname === '/' || breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-1" />
              )}
              
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="flex items-center space-x-1 text-gray-900 dark:text-white font-medium">
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Hook para usar breadcrumbs customizados
export function useBreadcrumbs() {
  const pathname = usePathname();
  
  const setBreadcrumbs = (items: BreadcrumbItem[]) => {
    // Esta função pode ser expandida para usar um contexto global
    // Por enquanto, retorna os items para uso direto no componente
    return items;
  };
  
  const getDefaultBreadcrumbs = () => {
    return generateBreadcrumbsFromPath(pathname);
  };
  
  return {
    setBreadcrumbs,
    getDefaultBreadcrumbs,
  };
}