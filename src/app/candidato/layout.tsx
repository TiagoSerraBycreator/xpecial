'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  Home, 
  Briefcase, 
  FileText, 
  User, 
  GraduationCap, 
  Award, 
  Search,
  Bell,
  Settings,
  BarChart3,
  MessageCircle
} from 'lucide-react';

interface CandidateLayoutProps {
  children: React.ReactNode;
}

export default function CandidateLayout({ children }: CandidateLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'CANDIDATE') {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'CANDIDATE') {
    return null;
  }

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/candidato',
      icon: Home,
      description: 'Visão geral do seu perfil',
      isActive: pathname === '/candidato'
    },
    {
      name: 'Insights',
      href: '/candidato/insights',
      icon: BarChart3,
      description: 'Análises e estatísticas',
      isActive: pathname.startsWith('/candidato/insights')
    },
    {
      name: 'Vagas',
      href: '/candidato/vagas',
      icon: Search,
      description: 'Buscar e explorar oportunidades',
      isActive: pathname.startsWith('/candidato/vagas')
    },
    {
      name: 'Candidaturas',
      href: '/candidato/candidaturas',
      icon: FileText,
      description: 'Acompanhar suas aplicações',
      isActive: pathname.startsWith('/candidato/candidaturas')
    },
    // {
    //   name: 'Mensagens',
    //   href: '/candidato/mensagens',
    //   icon: MessageCircle,
    //   description: 'Conversar com empresas',
    //   isActive: pathname.startsWith('/candidato/mensagens')
    // },
    {
      name: 'Perfil',
      href: '/candidato/perfil',
      icon: User,
      description: 'Gerenciar informações pessoais',
      isActive: pathname.startsWith('/candidato/perfil')
    },
    {
      name: 'Configurações',
      href: '/candidato/configuracoes',
      icon: Settings,
      description: 'Configurações da conta',
      isActive: pathname.startsWith('/candidato/configuracoes')
    },
    // {
    //   name: 'Academia',
    //   href: '/candidato/academia',
    //   icon: GraduationCap,
    //   description: 'Cursos e desenvolvimento',
    //   isActive: pathname.startsWith('/candidato/academia')
    // },
    // {
    //   name: 'Certificados',
    //   href: '/candidato/certificados',
    //   icon: Award,
    //   description: 'Suas certificações',
    //   isActive: pathname.startsWith('/candidato/certificados')
    // }
  ];

  const userRole = 'candidate';

  return (
    <DashboardLayout
      menuItems={menuItems}
      userRole={userRole}
      headerTitle="Área do Candidato"
      headerSubtitle="Gerencie sua carreira e oportunidades"
    >
      {children}
    </DashboardLayout>
  );
}