'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useIBGELocation } from '@/hooks/useIBGELocation';
import {
  User,
  Camera,
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  Globe,
  Star,
  FileText,
  Link,
  Github,
  Linkedin,
  Instagram,
  Twitter,
  ExternalLink,
  Upload,
  Download,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Info,
  Settings,
  Shield,
  Bell,
  Lock,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Languages,
  BookOpen,
  Target,
  TrendingUp,
  Users,
  Clock,
  Building2,
  Code,
  Zap,
  Heart,
  MessageSquare,
  Share2,
  Copy,
  QrCode,
  Play
} from 'lucide-react';

interface CandidateProfile {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  dateOfBirth: string;
  bio: string;
  experience: string;
  education: string;
  skills: string[];
  languages: string[];
  profileVideoUrl?: string;
  profilePhoto?: string;
  portfolio?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  availability?: string;
  salaryExpectation?: number;
  workMode?: string;
  jobTitle?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  achievements?: string[];
  interests?: string[];
}

interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  technologies?: string[];
}

interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  gpa?: string;
}

interface Certification {
  id?: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export default function CandidateProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { estados, municipios, loadingEstados, loadingMunicipios, fetchMunicipios } = useIBGELocation();
  
  // States
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [newInterest, setNewInterest] = useState('');
  
  // Profile data
  const [profile, setProfile] = useState<CandidateProfile>({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    dateOfBirth: '',
    bio: '',
    experience: '',
    education: '',
    skills: [],
    languages: [],
    portfolio: '',
    linkedin: '',
    github: '',
    website: '',
    availability: 'AVAILABLE',
    salaryExpectation: 0,
    workMode: 'HYBRID',
    jobTitle: '',
    yearsOfExperience: 0,
    certifications: [],
    achievements: [],
    interests: []
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // Função para extrair ID do vídeo do YouTube
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Função para validar URL do YouTube
  const isValidYouTubeUrl = (url: string) => {
    if (!url) return true; // URL vazia é válida
    return getYouTubeVideoId(url) !== null;
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfile();
    }
  }, [session]);

  useEffect(() => {
    if (profile.state) {
      setSelectedEstado(profile.state);
      const estado = estados.find(e => e.sigla === profile.state);
      if (estado) {
        fetchMunicipios(estado.id);
      }
    }
  }, [profile.state, estados]);

  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await fetch('/api/candidate/profile');
      if (response.ok) {
        const data = await response.json();
        console.log('Dados recebidos da API:', data);
        
        // A API retorna os dados diretamente, não em data.profile
        setProfile({
          ...profile,
          id: data.id || '',
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          city: data.city || '',
          state: data.state || '',
          dateOfBirth: data.dateOfBirth || '',
          bio: data.bio || '',
          experience: data.experience || '',
          education: data.education || '',
          skills: data.skills || [],
          languages: data.languages || [],
          profileVideoUrl: data.profileVideoUrl || '',
          profilePhoto: data.profilePhoto || '',
          availability: data.availability || 'AVAILABLE',
          certifications: data.certifications || [],
          achievements: data.achievements || [],
          interests: data.interests || []
        });
        
        // Por enquanto, experiences, educations e certifications não estão na API
        // Mantemos os arrays vazios até implementarmos essas funcionalidades
        setExperiences([]);
        setEducations([]);
        setCertifications([]);
      } else {
        console.error('Erro ao buscar perfil:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      setSaveSuccess(false);
      
      const response = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        // Mostra feedback de sucesso
        setSaveSuccess(true);
        // Depois sai do modo de edição
        setIsEditing(false);
        
        // Remove o feedback após 3 segundos
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Erro ao salvar perfil:', errorData.error || response.statusText);
        alert(`Erro ao salvar perfil: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setIsLoading(true);
      const response = await fetch('/api/candidate/avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, profilePhoto: data.avatarUrl }));
        // Removido await update() para evitar recarregamento da página
        // Mostra feedback de sucesso
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        console.error('Erro ao fazer upload do avatar:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsLoading(false);
      // Limpa o input para permitir upload do mesmo arquivo novamente se necessário
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !profile.languages.includes(newLanguage.trim())) {
      setProfile(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !profile.certifications?.includes(newCertification.trim())) {
      setProfile(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications?.filter(c => c !== cert) || []
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim() && !profile.achievements?.includes(newAchievement.trim())) {
      setProfile(prev => ({
        ...prev,
        achievements: [...(prev.achievements || []), newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (achievement: string) => {
    setProfile(prev => ({
      ...prev,
      achievements: prev.achievements?.filter(a => a !== achievement) || []
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests?.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...(prev.interests || []), newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests?.filter(i => i !== interest) || []
    }));
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE': return 'Disponível';
      case 'EMPLOYED': return 'Empregado';
      case 'NOT_AVAILABLE': return 'Indisponível';
      default: return availability;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'EMPLOYED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'NOT_AVAILABLE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWorkModeLabel = (mode: string) => {
    switch (mode) {
      case 'REMOTE': return 'Remoto';
      case 'HYBRID': return 'Híbrido';
      case 'ONSITE': return 'Presencial';
      default: return mode;
    }
  };

  const tabs = [
    { id: 'personal', label: 'Informações Pessoais', icon: User },
    { id: 'professional', label: 'Experiência', icon: Briefcase },
    { id: 'education', label: 'Educação', icon: GraduationCap },
    { id: 'skills', label: 'Habilidades', icon: Award },
    { id: 'social', label: 'Redes Sociais', icon: Globe },
    { id: 'preferences', label: 'Preferências', icon: Settings }
  ];

  if (isLoadingProfile) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">
            Mantenha suas informações atualizadas para melhores oportunidades
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit3 className="h-4 w-4" />
              <span>Editar Perfil</span>
            </button>
          )}
        </div>
        
        {/* Feedback de sucesso */}
        {saveSuccess && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Perfil salvo com sucesso!</span>
          </div>
        )}
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.fullName?.charAt(0) || session?.user?.name?.charAt(0) || 'U'
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.fullName || session?.user?.name || 'Nome não informado'}
              </h2>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getAvailabilityColor(profile.availability || 'AVAILABLE')}`}>
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <span>{getAvailabilityLabel(profile.availability || 'AVAILABLE')}</span>
              </div>
            </div>
            
            {profile.jobTitle && (
              <p className="text-lg text-gray-700 mb-2">{profile.jobTitle}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              {profile.city && profile.state && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.city}, {profile.state}</span>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
            
            {profile.bio && (
              <p className="text-gray-700 text-sm line-clamp-2">{profile.bio}</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">{profile.yearsOfExperience || 0}</div>
              <div className="text-xs text-gray-600">Anos de experiência</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">{profile.skills?.length || 0}</div>
              <div className="text-xs text-gray-600">Habilidades</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">{experiences.length}</div>
              <div className="text-xs text-gray-600">Experiências</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">{educations.length}</div>
              <div className="text-xs text-gray-600">Formações</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.fullName || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  {isEditing ? (
                    <select
                      value={profile.state}
                      onChange={(e) => {
                        setProfile(prev => ({ ...prev, state: e.target.value, city: '' }));
                        setSelectedEstado(e.target.value);
                        const estado = estados.find(est => est.sigla === e.target.value);
                        if (estado) {
                          fetchMunicipios(estado.id);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um estado</option>
                      {estados.map((estado) => (
                        <option key={estado.sigla} value={estado.sigla}>
                          {estado.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{profile.state || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  {isEditing ? (
                    <select
                      value={profile.city}
                      onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!selectedEstado || loadingMunicipios}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Selecione uma cidade</option>
                      {municipios.map((municipio) => (
                        <option key={municipio.id} value={municipio.nome}>
                          {municipio.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{profile.city || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo Atual/Desejado
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.jobTitle || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Desenvolvedor Frontend"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.jobTitle || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anos de Experiência
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={profile.yearsOfExperience || 0}
                      onChange={(e) => setProfile(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.yearsOfExperience || 0} anos</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biografia
                </label>
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Conte um pouco sobre você, sua experiência e objetivos profissionais..."
                  />
                ) : (
                  <p className="text-gray-900">{profile.bio || 'Não informado'}</p>
                )}
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Skills */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Habilidades Técnicas</h3>
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Nova habilidade"
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <button
                        onClick={addSkill}
                        className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{skill}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skill)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {profile.skills.length === 0 && (
                    <p className="text-gray-500 text-sm">Nenhuma habilidade adicionada</p>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Idiomas</h3>
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Novo idioma"
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                      />
                      <button
                        onClick={addLanguage}
                        className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{language}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeLanguage(language)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {profile.languages.length === 0 && (
                    <p className="text-gray-500 text-sm">Nenhum idioma adicionado</p>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Certificações</h3>
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="Nova certificação"
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                      />
                      <button
                        onClick={addCertification}
                        className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications?.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{cert}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeCertification(cert)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(!profile.certifications || profile.certifications.length === 0) && (
                    <p className="text-gray-500 text-sm">Nenhuma certificação adicionada</p>
                  )}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Conquistas</h3>
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        placeholder="Nova conquista"
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                      />
                      <button
                        onClick={addAchievement}
                        className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {profile.achievements?.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span className="text-gray-900">{achievement}</span>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeAchievement(achievement)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(!profile.achievements || profile.achievements.length === 0) && (
                    <p className="text-gray-500 text-sm">Nenhuma conquista adicionada</p>
                  )}
                </div>
              </div>

              {/* Interests */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Interesses</h3>
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Novo interesse"
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      />
                      <button
                        onClick={addInterest}
                        className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests?.map((interest, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{interest}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeInterest(interest)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(!profile.interests || profile.interests.length === 0) && (
                    <p className="text-gray-500 text-sm">Nenhum interesse adicionado</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Social Networks Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Linkedin className="h-4 w-4 text-blue-600" />
                      <span>LinkedIn</span>
                    </div>
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.linkedin || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/seu-perfil"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900">{profile.linkedin || 'Não informado'}</p>
                      {profile.linkedin && (
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Github className="h-4 w-4 text-gray-900" />
                      <span>GitHub</span>
                    </div>
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.github || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, github: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://github.com/seu-usuario"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900">{profile.github || 'Não informado'}</p>
                      {profile.github && (
                        <a
                          href={profile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      <span>Website/Portfólio</span>
                    </div>
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.website || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://seu-portfolio.com"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900">{profile.website || 'Não informado'}</p>
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span>Portfólio</span>
                    </div>
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.portfolio || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, portfolio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Link para seu portfólio"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900">{profile.portfolio || 'Não informado'}</p>
                      {profile.portfolio && (
                        <a
                          href={profile.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Play className="h-4 w-4 text-red-600" />
                      <span>Vídeo de Apresentação</span>
                    </div>
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={profile.profileVideoUrl || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, profileVideoUrl: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                          profile.profileVideoUrl && !isValidYouTubeUrl(profile.profileVideoUrl)
                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                      {profile.profileVideoUrl && !isValidYouTubeUrl(profile.profileVideoUrl) && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="h-3 w-3" />
                          <span>URL do YouTube inválida. Use um link válido do YouTube.</span>
                        </div>
                      )}
                      {profile.profileVideoUrl && isValidYouTubeUrl(profile.profileVideoUrl) && (
                        <div className="flex items-center space-x-1 text-green-600 text-xs">
                          <Check className="h-3 w-3" />
                          <span>URL válida do YouTube</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Cole o link do seu vídeo de apresentação no YouTube (ex: https://youtube.com/watch?v=abc123)
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900">{profile.profileVideoUrl || 'Não informado'}</p>
                      {profile.profileVideoUrl && (
                        <a
                          href={profile.profileVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                  {!isEditing && profile.profileVideoUrl && (
                    <div className="mt-3">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        {getYouTubeVideoId(profile.profileVideoUrl) ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(profile.profileVideoUrl)}`}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                              <Play className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">Vídeo não disponível</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status de Disponibilidade
                  </label>
                  {isEditing ? (
                    <select
                      value={profile.availability || 'AVAILABLE'}
                      onChange={(e) => setProfile(prev => ({ ...prev, availability: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="AVAILABLE">Disponível</option>
                      <option value="EMPLOYED">Empregado</option>
                      <option value="NOT_AVAILABLE">Indisponível</option>
                    </select>
                  ) : (
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getAvailabilityColor(profile.availability || 'AVAILABLE')}`}>
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                      <span>{getAvailabilityLabel(profile.availability || 'AVAILABLE')}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modalidade de Trabalho Preferida
                  </label>
                  {isEditing ? (
                    <select
                      value={profile.workMode || 'HYBRID'}
                      onChange={(e) => setProfile(prev => ({ ...prev, workMode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="REMOTE">Remoto</option>
                      <option value="HYBRID">Híbrido</option>
                      <option value="ONSITE">Presencial</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{getWorkModeLabel(profile.workMode || 'HYBRID')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expectativa Salarial (R$)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={profile.salaryExpectation || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, salaryExpectation: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 5000"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profile.salaryExpectation ? `R$ ${profile.salaryExpectation.toLocaleString()}` : 'Não informado'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Professional Experience Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Experiência Profissional</h3>
                {isEditing && (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Experiência</span>
                  </button>
                )}
              </div>

              {experiences.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma experiência adicionada</h3>
                  <p className="text-gray-600">Adicione suas experiências profissionais para destacar seu perfil.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {experiences.map((exp, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                          <p className="text-gray-700">{exp.company}</p>
                          <p className="text-sm text-gray-600">
                            {exp.startDate} - {exp.current ? 'Atual' : exp.endDate}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                          )}
                        </div>
                        {isEditing && (
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Formação Acadêmica</h3>
                {isEditing && (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Formação</span>
                  </button>
                )}
              </div>

              {educations.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma formação adicionada</h3>
                  <p className="text-gray-600">Adicione sua formação acadêmica para completar seu perfil.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {educations.map((edu, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{edu.degree} em {edu.field}</h4>
                          <p className="text-gray-700">{edu.institution}</p>
                          <p className="text-sm text-gray-600">
                            {edu.startDate} - {edu.current ? 'Cursando' : edu.endDate}
                          </p>
                          {edu.description && (
                            <p className="text-sm text-gray-700 mt-2">{edu.description}</p>
                          )}
                        </div>
                        {isEditing && (
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}