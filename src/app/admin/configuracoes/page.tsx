'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield, Mail, Bell, Users, Database, Globe, Save, Check, AlertCircle, Send } from 'lucide-react';

interface ConfigSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

export default function ConfiguracoesPage() {
  const [activeSection, setActiveSection] = useState('geral');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Estados para configurações gerais
  const [generalConfig, setGeneralConfig] = useState({
    siteName: 'Xpecial',
    siteDescription: 'Plataforma de recrutamento e seleção',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    maintenanceMode: false,
    registrationEnabled: true,
    maxUsersPerCompany: 50
  });

  // Estados para configurações de segurança
  const [securityConfig, setSecurityConfig] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    sessionTimeout: 24,
    twoFactorEnabled: false,
    loginAttempts: 5,
    lockoutDuration: 30
  });

  // Estados para configurações de email
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@xpecial.com',
    fromName: 'Xpecial',
    enableSSL: true
  });

  // Estados para configurações de notificações
  const [notificationConfig, setNotificationConfig] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    systemAlerts: true,
    marketingEmails: false
  });

  // Estados para teste de SMTP
  const [testEmailConfig, setTestEmailConfig] = useState({
    testEmail: '',
    subject: 'Teste de Configuração SMTP - Xpecial',
    message: 'Este é um email de teste para verificar se as configurações SMTP estão funcionando corretamente.'
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  // Função para carregar configurações
  const loadConfigurations = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const configs = await response.json();
        
        // Atualizar estados com as configurações carregadas
        if (configs.smtpHost !== undefined) {
          setEmailConfig(prev => ({
            ...prev,
            smtpHost: configs.smtpHost || '',
            smtpPort: configs.smtpPort || 587,
            smtpUser: configs.smtpUser || '',
            smtpPassword: configs.smtpPassword || '',
            fromEmail: configs.fromEmail || 'noreply@xpecial.com',
            fromName: configs.fromName || 'Xpecial',
            enableSSL: configs.enableSSL !== undefined ? configs.enableSSL : true
          }));
        }

        if (configs.emailNotifications !== undefined) {
          setNotificationConfig(prev => ({
            ...prev,
            emailNotifications: configs.emailNotifications !== undefined ? configs.emailNotifications : true,
            pushNotifications: configs.pushNotifications !== undefined ? configs.pushNotifications : true,
            smsNotifications: configs.smsNotifications !== undefined ? configs.smsNotifications : false,
            weeklyReports: configs.weeklyReports !== undefined ? configs.weeklyReports : true,
            systemAlerts: configs.systemAlerts !== undefined ? configs.systemAlerts : true,
            marketingEmails: configs.marketingEmails !== undefined ? configs.marketingEmails : false
          }));
        }

        if (configs.maxLoginAttempts !== undefined) {
          setSecurityConfig(prev => ({
            ...prev,
            loginAttempts: configs.maxLoginAttempts || 5,
            lockoutDuration: configs.lockoutDuration || 30
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  // Carregar configurações na inicialização
  useEffect(() => {
    loadConfigurations();
  }, []);

  const sections: ConfigSection[] = [
    {
      id: 'geral',
      title: 'Configurações Gerais',
      icon: <Settings className="h-5 w-5" />,
      description: 'Configurações básicas da plataforma'
    },
    {
      id: 'seguranca',
      title: 'Segurança',
      icon: <Shield className="h-5 w-5" />,
      description: 'Configurações de segurança e autenticação'
    },
    {
      id: 'email',
      title: 'Email',
      icon: <Mail className="h-5 w-5" />,
      description: 'Configurações de SMTP e emails'
    },
    {
      id: 'notificacoes',
      title: 'Notificações',
      icon: <Bell className="h-5 w-5" />,
      description: 'Configurações de notificações'
    },
    {
      id: 'usuarios',
      title: 'Usuários',
      icon: <Users className="h-5 w-5" />,
      description: 'Configurações de usuários e permissões'
    },
    {
      id: 'backup',
      title: 'Backup',
      icon: <Database className="h-5 w-5" />,
      description: 'Configurações de backup e manutenção'
    },
    {
      id: 'teste-smtp',
      title: 'Teste SMTP',
      icon: <Send className="h-5 w-5" />,
      description: 'Testar configurações de email SMTP'
    }
  ];

  const handleSendTestEmail = async () => {
    if (!testEmailConfig.testEmail) {
      setTestStatus('error');
      setTestMessage('Por favor, insira um email para teste.');
      return;
    }

    setTestStatus('sending');
    setTestMessage('');

    try {
      const response = await fetch('/api/admin/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testEmailConfig.testEmail,
          subject: testEmailConfig.subject,
          message: testEmailConfig.message,
          smtpConfig: emailConfig
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('Email de teste enviado com sucesso!');
      } else {
        setTestStatus('error');
        setTestMessage(result.error || 'Erro ao enviar email de teste.');
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage('Erro de conexão ao tentar enviar email.');
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      // Preparar dados para envio
      const configData = {
        // Configurações de segurança
        maxLoginAttempts: securityConfig.loginAttempts,
        lockoutDuration: securityConfig.lockoutDuration,
        
        // Configurações de email
        smtpHost: emailConfig.smtpHost,
        smtpPort: emailConfig.smtpPort,
        smtpUser: emailConfig.smtpUser,
        smtpPassword: emailConfig.smtpPassword,
        fromEmail: emailConfig.fromEmail,
        fromName: emailConfig.fromName,
        enableSSL: emailConfig.enableSSL,
        
        // Configurações de notificações
        emailNotifications: notificationConfig.emailNotifications,
        pushNotifications: notificationConfig.pushNotifications,
        smsNotifications: notificationConfig.smsNotifications,
        weeklyReports: notificationConfig.weeklyReports,
        systemAlerts: notificationConfig.systemAlerts,
        marketingEmails: notificationConfig.marketingEmails
      };

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });

      const result = await response.json();

      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        console.error('Erro ao salvar:', result.error);
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Erro ao salvar configurações:', error);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const renderGeneralConfig = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Site
          </label>
          <input
            type="text"
            value={generalConfig.siteName}
            onChange={(e) => setGeneralConfig({...generalConfig, siteName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={generalConfig.timezone}
            onChange={(e) => setGeneralConfig({...generalConfig, timezone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
            <option value="America/New_York">New York (UTC-5)</option>
            <option value="Europe/London">London (UTC+0)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição do Site
        </label>
        <textarea
          value={generalConfig.siteDescription}
          onChange={(e) => setGeneralConfig({...generalConfig, siteDescription: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de Usuários por Empresa
          </label>
          <input
            type="number"
            value={generalConfig.maxUsersPerCompany}
            onChange={(e) => setGeneralConfig({...generalConfig, maxUsersPerCompany: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="maintenance"
            checked={generalConfig.maintenanceMode}
            onChange={(e) => setGeneralConfig({...generalConfig, maintenanceMode: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="maintenance" className="ml-2 block text-sm text-gray-900">
            Modo de Manutenção
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="registration"
            checked={generalConfig.registrationEnabled}
            onChange={(e) => setGeneralConfig({...generalConfig, registrationEnabled: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="registration" className="ml-2 block text-sm text-gray-900">
            Permitir Novos Registros
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecurityConfig = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tamanho Mínimo da Senha
          </label>
          <input
            type="number"
            value={securityConfig.passwordMinLength}
            onChange={(e) => setSecurityConfig({...securityConfig, passwordMinLength: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeout de Sessão (horas)
          </label>
          <input
            type="number"
            value={securityConfig.sessionTimeout}
            onChange={(e) => setSecurityConfig({...securityConfig, sessionTimeout: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tentativas de Login
          </label>
          <input
            type="number"
            value={securityConfig.loginAttempts}
            onChange={(e) => setSecurityConfig({...securityConfig, loginAttempts: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duração do Bloqueio (minutos)
          </label>
          <input
            type="number"
            value={securityConfig.lockoutDuration}
            onChange={(e) => setSecurityConfig({...securityConfig, lockoutDuration: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="specialChars"
            checked={securityConfig.requireSpecialChars}
            onChange={(e) => setSecurityConfig({...securityConfig, requireSpecialChars: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="specialChars" className="ml-2 block text-sm text-gray-900">
            Exigir Caracteres Especiais na Senha
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireNumbers"
            checked={securityConfig.requireNumbers}
            onChange={(e) => setSecurityConfig({...securityConfig, requireNumbers: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="requireNumbers" className="ml-2 block text-sm text-gray-900">
            Exigir Números na Senha
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="twoFactor"
            checked={securityConfig.twoFactorEnabled}
            onChange={(e) => setSecurityConfig({...securityConfig, twoFactorEnabled: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="twoFactor" className="ml-2 block text-sm text-gray-900">
            Habilitar Autenticação de Dois Fatores
          </label>
        </div>
      </div>
    </div>
  );

  const renderEmailConfig = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Servidor SMTP
          </label>
          <input
            type="text"
            value={emailConfig.smtpHost}
            onChange={(e) => setEmailConfig({...emailConfig, smtpHost: e.target.value})}
            placeholder="smtp.gmail.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Porta SMTP
          </label>
          <input
            type="number"
            value={emailConfig.smtpPort}
            onChange={(e) => setEmailConfig({...emailConfig, smtpPort: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Usuário SMTP
          </label>
          <input
            type="text"
            value={emailConfig.smtpUser}
            onChange={(e) => setEmailConfig({...emailConfig, smtpUser: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Senha SMTP
          </label>
          <input
            type="password"
            value={emailConfig.smtpPassword}
            onChange={(e) => setEmailConfig({...emailConfig, smtpPassword: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Remetente
          </label>
          <input
            type="email"
            value={emailConfig.fromEmail}
            onChange={(e) => setEmailConfig({...emailConfig, fromEmail: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Remetente
          </label>
          <input
            type="text"
            value={emailConfig.fromName}
            onChange={(e) => setEmailConfig({...emailConfig, fromName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="enableSSL"
          checked={emailConfig.enableSSL}
          onChange={(e) => setEmailConfig({...emailConfig, enableSSL: e.target.checked})}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="enableSSL" className="ml-2 block text-sm text-gray-900">
          Habilitar SSL/TLS
        </label>
      </div>
    </div>
  );

  const renderNotificationConfig = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={notificationConfig.emailNotifications}
            onChange={(e) => setNotificationConfig({...notificationConfig, emailNotifications: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
            Notificações por Email
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="pushNotifications"
            checked={notificationConfig.pushNotifications}
            onChange={(e) => setNotificationConfig({...notificationConfig, pushNotifications: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-900">
            Notificações Push
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="smsNotifications"
            checked={notificationConfig.smsNotifications}
            onChange={(e) => setNotificationConfig({...notificationConfig, smsNotifications: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-900">
            Notificações por SMS
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="weeklyReports"
            checked={notificationConfig.weeklyReports}
            onChange={(e) => setNotificationConfig({...notificationConfig, weeklyReports: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="weeklyReports" className="ml-2 block text-sm text-gray-900">
            Relatórios Semanais
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="systemAlerts"
            checked={notificationConfig.systemAlerts}
            onChange={(e) => setNotificationConfig({...notificationConfig, systemAlerts: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="systemAlerts" className="ml-2 block text-sm text-gray-900">
            Alertas do Sistema
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="marketingEmails"
            checked={notificationConfig.marketingEmails}
            onChange={(e) => setNotificationConfig({...notificationConfig, marketingEmails: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="marketingEmails" className="ml-2 block text-sm text-gray-900">
            Emails de Marketing
          </label>
        </div>
      </div>
    </div>
  );

  const renderTestSmtpConfig = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Teste de Configuração SMTP</h3>
            <p className="text-sm text-blue-700 mt-1">
              Use esta seção para testar se as configurações de email SMTP estão funcionando corretamente. 
              Certifique-se de configurar primeiro as configurações de email na aba &quot;Email&quot;.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de Destino *
          </label>
          <input
            type="email"
            value={testEmailConfig.testEmail}
            onChange={(e) => setTestEmailConfig({...testEmailConfig, testEmail: e.target.value})}
            placeholder="exemplo@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Insira o email onde deseja receber o teste
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assunto do Email
          </label>
          <input
            type="text"
            value={testEmailConfig.subject}
            onChange={(e) => setTestEmailConfig({...testEmailConfig, subject: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensagem do Email
          </label>
          <textarea
            value={testEmailConfig.message}
            onChange={(e) => setTestEmailConfig({...testEmailConfig, message: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Status do teste */}
      {testMessage && (
        <div className={`p-4 rounded-lg ${
          testStatus === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {testStatus === 'success' ? (
              <Check className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span className={`text-sm font-medium ${
              testStatus === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {testMessage}
            </span>
          </div>
        </div>
      )}

      {/* Botão de envio */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleSendTestEmail}
          disabled={testStatus === 'sending' || !testEmailConfig.testEmail}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
          <span>
            {testStatus === 'sending' ? 'Enviando...' : 'Enviar Email de Teste'}
          </span>
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'geral':
        return renderGeneralConfig();
      case 'seguranca':
        return renderSecurityConfig();
      case 'email':
        return renderEmailConfig();
      case 'notificacoes':
        return renderNotificationConfig();
      case 'usuarios':
        return (
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Configurações de usuários em desenvolvimento</p>
          </div>
        );
      case 'backup':
        return (
          <div className="text-center py-8">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Configurações de backup em desenvolvimento</p>
          </div>
        );
      case 'teste-smtp':
        return renderTestSmtpConfig();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configurações do Sistema
          </h1>
          <p className="text-gray-600">
            Gerencie configurações globais, segurança e parâmetros da plataforma
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {section.icon}
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-gray-500">{section.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
                <p className="text-gray-600">
                  {sections.find(s => s.id === activeSection)?.description}
                </p>
              </div>

              {renderContent()}

              {/* Save Button */}
              {(activeSection === 'geral' || activeSection === 'seguranca' || activeSection === 'email' || activeSection === 'notificacoes') && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {saveStatus === 'saved' && (
                        <>
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="text-green-600 text-sm">Configurações salvas com sucesso!</span>
                        </>
                      )}
                      {saveStatus === 'error' && (
                        <>
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <span className="text-red-600 text-sm">Erro ao salvar configurações</span>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>
                        {saveStatus === 'saving' ? 'Salvando...' : 'Salvar Configurações'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}