'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Briefcase, 
  BarChart3, 
  MessageSquare,
  User,
  TrendingUp,
  FileText,
  Settings
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';

interface EmpresaLayoutProps {
  children: React.ReactNode;
}

export default function EmpresaLayout({ children }: EmpresaLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'COMPANY') {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/empresa',
      icon: BarChart3,
      description: 'Visão geral da empresa',
      isActive: pathname === '/empresa'
    },
    {
      name: 'Vagas',
      href: '/empresa/vagas',
      icon: Briefcase,
      description: 'Gerenciar vagas',
      isActive: pathname.startsWith('/empresa/vagas')
    },
    {
      name: 'Candidatos',
      href: '/empresa/candidatos',
      icon: Users,
      description: 'Candidatos e aplicações',
      isActive: pathname.startsWith('/empresa/candidatos')
    },
    {
      name: 'Insights',
      href: '/empresa/insights',
      icon: TrendingUp,
      description: 'Análises e métricas',
      isActive: pathname.startsWith('/empresa/insights')
    },
    {
      name: 'Perfil',
      href: '/empresa/perfil',
      icon: Building2,
      description: 'Informações da empresa',
      isActive: pathname.startsWith('/empresa/perfil')
    },
    {
      name: 'Configurações',
      href: '/empresa/configuracoes',
      icon: Settings,
      description: 'Configurações da conta',
      isActive: pathname.startsWith('/empresa/configuracoes')
    }
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando painel da empresa...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'COMPANY') {
    return null;
  }

  return (
    <DashboardLayout
      menuItems={menuItems}
      userRole={session.user.role}
      headerTitle="Painel da Empresa"
      headerSubtitle="Xpecial Business"
    >
      {children}
    </DashboardLayout>
  );
}