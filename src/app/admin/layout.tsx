'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  BarChart3, 
  User, 
  Home, 
  Briefcase, 
  Users, 
  Settings,
  Award,
  FileText,
  TrendingUp,
  Shield
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
      description: 'Visão geral',
      isActive: false
    },
    {
      name: 'Insights',
      href: '/admin/insights',
      icon: TrendingUp,
      description: 'Análises e métricas',
      isActive: false
    },
    {
      name: 'Usuários',
      href: '/admin/users',
      icon: Users,
      description: 'Gerenciar usuários',
      isActive: false
    },
    {
      name: 'Vagas',
      href: '/admin/jobs',
      icon: Briefcase,
      description: 'Moderar vagas',
      isActive: false
    },
    {
      name: 'Certificados',
      href: '/admin/certificados',
      icon: Award,
      description: 'Validar certificados',
      isActive: false
    },
    {
      name: 'Relatórios',
      href: '/admin/relatorios',
      icon: FileText,
      description: 'Relatórios do sistema',
      isActive: false
    },
    {
      name: 'Configurações',
      href: '/admin/configuracoes',
      icon: Settings,
      description: 'Configurações do sistema',
      isActive: false
    }
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <DashboardLayout
      menuItems={menuItems}
      userRole={session.user.role}
      headerTitle="Painel Administrativo"
      headerSubtitle="Xpecial Admin"
    >
      {children}
    </DashboardLayout>
  );
}