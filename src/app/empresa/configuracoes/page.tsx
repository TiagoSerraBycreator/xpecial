'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PasswordResetForm from '@/components/ui/password-reset-form';
import AccountActivity from '@/components/ui/account-activity';
import { Shield, Settings, Building2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function CompanyConfigPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao alterar senha');
      }

      alert('Senha alterada com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert(error instanceof Error ? error.message : 'Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountActivity = async (action: 'activate' | 'deactivate' | 'delete') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/account-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          password: '', // Será solicitado no modal
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro ao ${action === 'activate' ? 'ativar' : action === 'deactivate' ? 'desativar' : 'deletar'} conta`);
      }

      alert(`Conta ${action === 'activate' ? 'ativada' : action === 'deactivate' ? 'desativada' : 'deletada'} com sucesso!`);
    } catch (error) {
      console.error('Erro na atividade da conta:', error);
      alert(error instanceof Error ? error.message : 'Erro na operação');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie suas configurações de conta e segurança da empresa</p>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Atividade da Conta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Mantenha sua conta empresarial segura alterando sua senha regularmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordResetForm onSubmit={handlePasswordChange} loading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Gerenciar Conta
              </CardTitle>
              <CardDescription>
                Controle o status da sua conta empresarial e suas configurações de atividade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountActivity 
                isActive={session?.user?.isActive ?? true}
                onActivateAccount={() => handleAccountActivity('activate')}
                onDeactivateAccount={() => handleAccountActivity('deactivate')}
                onDeleteAccount={() => handleAccountActivity('delete')}
                loading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}