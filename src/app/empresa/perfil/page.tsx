'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useIBGELocation } from '@/hooks/useIBGELocation';
import {
  Building2,
  Camera,
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Globe,
  Eye,
  EyeOff,
  Lock,
  Briefcase,
  Target,
  ExternalLink
} from 'lucide-react';

interface CompanyProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  estado: string;
  cidade: string;
  website: string;
  foundedYear: string;
  employeeCount: string;
  industry: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  logo?: string;
  slug?: string;
}

export default function CompanyProfilePage() {
  const { data: session, update } = useSession();
  const { estados, municipios, loadingEstados, loadingMunicipios, fetchMunicipios } = useIBGELocation();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<CompanyProfile>({
    name: session?.user?.name || 'Empresa Exemplo',
    email: session?.user?.email || 'contato@empresa.com',
    phone: '+55 (11) 3333-4444',
    address: 'Av. Paulista, 1000',
    estado: 'SP',
    cidade: 'São Paulo',
    website: 'https://www.empresa.com.br',
    foundedYear: '2010',
    employeeCount: '50-100',
    industry: 'Tecnologia',
    description: 'Empresa inovadora focada em soluções tecnológicas para transformação digital de negócios.',
    mission: 'Transformar negócios através da tecnologia, oferecendo soluções inovadoras e eficientes.',
    vision: 'Ser referência em transformação digital no mercado brasileiro até 2030.',
    values: ['Inovação', 'Transparência', 'Excelência', 'Colaboração', 'Sustentabilidade'],
    logo: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newValue, setNewValue] = useState('');
  const [slugError, setSlugError] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  // Carregar dados da empresa
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch('/api/company/profile');
        if (response.ok) {
          const data = await response.json();
          setCompanyData(data);
          // Atualizar o perfil com os dados da empresa
          setProfile(prev => ({
            ...prev,
            name: data.name || prev.name,
            description: data.description || prev.description,
            website: data.website || prev.website,
            industry: data.sector || prev.industry,
            slug: data.slug || prev.slug,
            logo: data.logo || prev.logo,
            email: data.user?.email || session?.user?.email || prev.email,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            cidade: data.city || prev.cidade,
            estado: data.state || prev.estado,
            foundedYear: data.foundedYear || prev.foundedYear,
            employeeCount: data.employeeCount || prev.employeeCount,
            mission: data.mission || prev.mission,
            vision: data.vision || prev.vision,
            values: (() => {
              try {
                if (data.values) {
                  return typeof data.values === 'string' ? JSON.parse(data.values) : data.values;
                }
                return prev.values;
              } catch (error) {
                console.error('Erro ao fazer parse dos values:', error);
                return prev.values;
              }
            })()
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
      }
    };

    if (session?.user?.role === 'COMPANY') {
      fetchCompanyData();
    }
  }, [session]);

  // Carregar municípios se já houver um estado selecionado
  useEffect(() => {
    if (profile.estado && estados.length > 0) {
      const estado = estados.find(e => e.sigla === profile.estado);
      if (estado) {
        fetchMunicipios(estado.id);
      }
    }
  }, [profile.estado, estados, fetchMunicipios]);

  const handleInputChange = (field: keyof CompanyProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleEstadoChange = (estadoSigla: string) => {
    setProfile(prev => ({ ...prev, estado: estadoSigla, cidade: '' }));
    const estado = estados.find(e => e.sigla === estadoSigla);
    if (estado) {
      fetchMunicipios(estado.id);
    }
  };

  const formatLocation = () => {
    if (profile.cidade && profile.estado) {
      return `${profile.cidade}, ${profile.estado}`;
    } else if (profile.estado) {
      return profile.estado;
    }
    return 'Localização não informada';
  };

  const handleAddValue = () => {
    if (newValue.trim() && !profile.values.includes(newValue.trim())) {
      setProfile(prev => ({
        ...prev,
        values: [...prev.values, newValue.trim()]
      }));
      setNewValue('');
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      values: prev.values.filter(value => value !== valueToRemove)
    }));
  };

  const handleSlugChange = async (value: string) => {
    // Limpar e formatar o slug
    const formattedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '') // Remove caracteres especiais, mantém apenas letras, números e hífens
      .replace(/--+/g, '-') // Remove hífens duplicados
      .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim

    setProfile(prev => ({ ...prev, slug: formattedSlug }));
    setSlugError('');

    // Verificar disponibilidade se o slug não estiver vazio
    if (formattedSlug && formattedSlug.length >= 3) {
      setIsCheckingSlug(true);
      try {
        const response = await fetch('/api/company/validate-slug', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slug: formattedSlug })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setSlugError(data.error || 'Erro ao verificar disponibilidade');
          return;
        }
        
        if (!data.available) {
          setSlugError(data.error || 'Este slug já está em uso');
        }
      } catch (error) {
        console.error('Erro ao verificar slug:', error);
        setSlugError('Erro de conexão');
      } finally {
        setIsCheckingSlug(false);
      }
    } else if (formattedSlug && formattedSlug.length < 3) {
      setSlugError('O slug deve ter pelo menos 3 caracteres');
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          description: profile.description,
          website: profile.website,
          sector: profile.industry,
          phone: profile.phone,
          address: profile.address,
          city: profile.cidade,
          state: profile.estado,
          foundedYear: profile.foundedYear,
          employeeCount: profile.employeeCount,
          mission: profile.mission,
          vision: profile.vision,
          values: profile.values,
          slug: profile.slug,
          logo: profile.logo // Incluindo o logo na requisição
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar perfil');
      }
      
      const updatedCompany = await response.json();
      
      // Atualizar o estado local com os dados salvos
      setCompanyData(updatedCompany);
      setProfile(prev => ({
        ...prev,
        name: updatedCompany.name,
        description: updatedCompany.description || prev.description,
        website: updatedCompany.website || prev.website,
        industry: updatedCompany.sector || prev.industry,
        phone: updatedCompany.phone || prev.phone,
        address: updatedCompany.address || prev.address,
        cidade: updatedCompany.city || prev.cidade,
        estado: updatedCompany.state || prev.estado,
        foundedYear: updatedCompany.foundedYear || prev.foundedYear,
        employeeCount: updatedCompany.employeeCount || prev.employeeCount,
        mission: updatedCompany.mission || prev.mission,
        vision: updatedCompany.vision || prev.vision,
        values: updatedCompany.values ? JSON.parse(updatedCompany.values) : prev.values,
        slug: updatedCompany.slug || prev.slug,
        logo: updatedCompany.logo || prev.logo // Atualizando o logo no estado local
      }));
      
      // Update session if needed
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedCompany.name,
          image: updatedCompany.logo || profile.logo
        }
      });
      
      setIsEditing(false);
      alert('Perfil da empresa atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert(`Erro ao salvar perfil: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      alert('A nova senha deve ter pelo menos 8 caracteres!');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      alert('Senha alterada com sucesso!');
    } catch (error) {
      alert('Erro ao alterar senha. Verifique sua senha atual.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {profile.logo ? (
                  <img
                    src={profile.logo}
                    alt="Logo da Empresa"
                    className="w-20 h-20 rounded-lg object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-white font-bold text-xl">X</span>
                  </div>
                )}
                
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600">{profile.email}</p>
                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {formatLocation()}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Fundada em {profile.foundedYear}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {profile.employeeCount} funcionários
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {/* Link para perfil público - Destacado */}
              {companyData?.slug && (
                <a
                  href={`/empresa/${companyData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>🌐 Ver Perfil Público</span>
                </a>
              )}
              
              {/* Mensagem caso não tenha slug */}
              {!companyData?.slug && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg max-w-xs">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs leading-tight">Perfil público indisponível</span>
                </div>
              )}
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editar Perfil</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                Informações da Empresa
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {profile.email}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {profile.phone}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-500" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                        {profile.website}
                      </a>
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug do Perfil Público
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={profile.slug || ''}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          slugError ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="minha-empresa"
                      />
                      {slugError && (
                        <p className="text-red-500 text-xs mt-1">{slugError}</p>
                      )}
                      {isCheckingSlug && (
                        <p className="text-blue-500 text-xs mt-1">Verificando disponibilidade...</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        URL: /empresa/{profile.slug || 'seu-slug'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                      {profile.slug ? (
                        <span className="text-purple-600">/empresa/{profile.slug}</span>
                      ) : (
                        <span className="text-gray-400">Não configurado</span>
                      )}
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Rua, número, bairro..."
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {profile.address}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  {isEditing ? (
                    <select
                      value={profile.estado}
                      onChange={(e) => handleEstadoChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={loadingEstados}
                    >
                      <option value="">Selecione o estado</option>
                      {estados.map((estado) => (
                        <option key={estado.id} value={estado.sigla}>
                          {estado.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {estados.find(e => e.sigla === profile.estado)?.nome || profile.estado}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  {isEditing ? (
                    <select
                      value={profile.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={loadingMunicipios || !profile.estado}
                    >
                      <option value="">Selecione a cidade</option>
                      {municipios.map((municipio) => (
                        <option key={municipio.id} value={municipio.nome}>
                          {municipio.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {profile.cidade || 'Cidade não informada'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano de Fundação
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={profile.foundedYear}
                      onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {profile.foundedYear}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Funcionários
                  </label>
                  {isEditing ? (
                    <select
                      value={profile.employeeCount}
                      onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-100">51-100</option>
                      <option value="101-500">101-500</option>
                      <option value="501-1000">501-1000</option>
                      <option value="1000+">1000+</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      {profile.employeeCount}
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Setor/Indústria
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                      {profile.industry}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Descrição
              </h2>
              
              {isEditing ? (
                <textarea
                  value={profile.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descreva sua empresa..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              )}
            </div>
            
            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  Missão
                </h2>
                
                {isEditing ? (
                  <textarea
                    value={profile.mission}
                    onChange={(e) => handleInputChange('mission', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-700">{profile.mission}</p>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-purple-600" />
                  Visão
                </h2>
                
                {isEditing ? (
                  <textarea
                    value={profile.vision}
                    onChange={(e) => handleInputChange('vision', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-700">{profile.vision}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Values */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-600" />
                Valores
              </h2>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {profile.values.map((value, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                    >
                      {value}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveValue(value)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                
                {isEditing && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddValue()}
                      placeholder="Novo valor"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={handleAddValue}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Adicionar
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Change Password */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-purple-600" />
                Segurança
              </h2>
              
              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Alterar Senha
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isLoading ? 'Alterando...' : 'Alterar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}