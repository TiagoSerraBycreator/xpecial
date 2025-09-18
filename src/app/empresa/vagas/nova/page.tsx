'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useIBGELocation } from '@/hooks/useIBGELocation';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2, 
  FileText, 
  Users, 
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Minus,
  Info,
  Briefcase,
  Calendar,
  Globe,
  Target,
  Award,
  BookOpen,
  Lightbulb
} from 'lucide-react';

interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  city: string;
  state: string;
  location: string;
  salary: string;
  salaryMin: string;
  salaryMax: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  level: 'JUNIOR' | 'PLENO' | 'SENIOR' | 'LEAD';
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  status: 'ACTIVE' | 'DRAFT';
  skills: string[];
  experienceYears: string;
  education: string;
  languages: string[];
}

export default function NewJob() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | null>(null);
  
  // Hook para carregar estados e municípios do IBGE
  const { estados, municipios, loadingEstados, loadingMunicipios, error: ibgeError, fetchMunicipios } = useIBGELocation();

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    city: '',
    state: '',
    location: '',
    salary: '',
    salaryMin: '',
    salaryMax: '',
    type: 'FULL_TIME',
    level: 'PLENO',
    workMode: 'HYBRID',
    status: 'DRAFT',
    skills: [],
    experienceYears: '',
    education: '',
    languages: [],
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'COMPANY') {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  // Função para lidar com mudança de estado
  const handleEstadoChange = (estadoId: string) => {
    const estado = estados.find(e => e.id.toString() === estadoId);
    if (estado) {
      setSelectedEstadoId(estado.id);
      setFormData(prev => ({ 
        ...prev, 
        state: estado.sigla,
        city: '', // Limpar cidade quando mudar estado
        location: '' // Limpar localização
      }));
      fetchMunicipios(estado.id);
    }
  };

  // Função para lidar com mudança de cidade
  const handleCidadeChange = (cidadeNome: string) => {
    setFormData(prev => ({ 
      ...prev, 
      city: cidadeNome,
      location: `${cidadeNome}, ${prev.state}` // Atualizar localização automaticamente
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Requisitos são obrigatórios';
    }

    if (!formData.responsibilities.trim()) {
      newErrors.responsibilities = 'Responsabilidades são obrigatórias';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const jobData = {
        ...formData,
        status: isDraft ? 'DRAFT' : formData.status,
        skills: formData.skills.join(','),
        languages: formData.languages.join(','),
      };

      const response = await fetch('/api/company/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/empresa/vagas/${result.id}`);
      } else {
        const error = await response.json();
        console.error('Error creating job:', error);
        alert('Erro ao criar vaga. Tente novamente.');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Erro ao criar vaga. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_TIME':
        return 'Tempo Integral';
      case 'PART_TIME':
        return 'Meio Período';
      case 'CONTRACT':
        return 'Contrato';
      case 'INTERNSHIP':
        return 'Estágio';
      default:
        return type;
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'JUNIOR':
        return 'Júnior';
      case 'PLENO':
        return 'Pleno';
      case 'SENIOR':
        return 'Sênior';
      case 'LEAD':
        return 'Lead';
      default:
        return level;
    }
  };

  const getWorkModeLabel = (mode: string) => {
    switch (mode) {
      case 'REMOTE':
        return 'Remoto';
      case 'HYBRID':
        return 'Híbrido';
      case 'ONSITE':
        return 'Presencial';
      default:
        return mode;
    }
  };

  const steps = [
    { id: 1, title: 'Informações Básicas', icon: FileText },
    { id: 2, title: 'Detalhes da Vaga', icon: Briefcase },
    { id: 3, title: 'Requisitos', icon: Target },
    { id: 4, title: 'Revisão', icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Vaga</h1>
            <p className="text-gray-600 mt-1">Crie uma nova oportunidade de emprego</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Ocultar' : 'Visualizar'}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Publicar Vaga
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Informações Básicas</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Vaga *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Desenvolvedor Frontend React"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da Vaga *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descreva a vaga, o que a empresa faz, cultura, etc..."
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Contrato
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="FULL_TIME">Tempo Integral</option>
                      <option value="PART_TIME">Meio Período</option>
                      <option value="CONTRACT">Contrato</option>
                      <option value="INTERNSHIP">Estágio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nível
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="JUNIOR">Júnior</option>
                      <option value="PLENO">Pleno</option>
                      <option value="SENIOR">Sênior</option>
                      <option value="LEAD">Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modalidade
                    </label>
                    <select
                      value={formData.workMode}
                      onChange={(e) => handleInputChange('workMode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="REMOTE">Remoto</option>
                      <option value="HYBRID">Híbrido</option>
                      <option value="ONSITE">Presencial</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Job Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Detalhes da Vaga</h2>
                </div>

                {/* Localização - Estado e Cidade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <select
                      value={selectedEstadoId?.toString() || ''}
                      onChange={(e) => handleEstadoChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.state ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={loadingEstados}
                    >
                      <option value="">
                        {loadingEstados ? 'Carregando estados...' : 'Selecione um estado'}
                      </option>
                      {estados.map((estado) => (
                        <option key={estado.id} value={estado.id.toString()}>
                          {estado.nome} ({estado.sigla})
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                    {ibgeError && (
                      <p className="mt-1 text-sm text-red-600">Erro ao carregar estados: {ibgeError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleCidadeChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={!selectedEstadoId || loadingMunicipios}
                    >
                      <option value="">
                        {!selectedEstadoId 
                          ? 'Selecione um estado primeiro' 
                          : loadingMunicipios 
                          ? 'Carregando cidades...' 
                          : 'Selecione uma cidade'
                        }
                      </option>
                      {municipios.map((municipio) => (
                        <option key={municipio.id} value={municipio.nome}>
                          {municipio.nome}
                        </option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                </div>

                {/* Localização gerada automaticamente */}
                {formData.location && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="font-medium">Localização:</span>
                      <span className="ml-2">{formData.location}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salário Mínimo
                    </label>
                    <input
                      type="text"
                      value={formData.salaryMin}
                      onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                      placeholder="Ex: R$ 5.000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salário Máximo
                    </label>
                    <input
                      type="text"
                      value={formData.salaryMax}
                      onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                      placeholder="Ex: R$ 8.000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsabilidades *
                  </label>
                  <textarea
                    value={formData.responsibilities}
                    onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                    placeholder="Liste as principais responsabilidades do cargo..."
                    rows={5}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.responsibilities ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.responsibilities && (
                    <p className="mt-1 text-sm text-red-600">{errors.responsibilities}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefícios
                  </label>
                  <textarea
                    value={formData.benefits}
                    onChange={(e) => handleInputChange('benefits', e.target.value)}
                    placeholder="Descreva os benefícios oferecidos..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Requirements */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Target className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Requisitos</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requisitos *
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="Liste os requisitos necessários para a vaga..."
                    rows={5}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.requirements ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.requirements && (
                    <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Anos de Experiência
                    </label>
                    <input
                      type="text"
                      value={formData.experienceYears}
                      onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                      placeholder="Ex: 2-4 anos"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Escolaridade
                    </label>
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      placeholder="Ex: Superior completo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Habilidades Técnicas
                  </label>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Ex: React, JavaScript, Python..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <button
                      onClick={addSkill}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idiomas
                  </label>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Ex: Inglês, Espanhol..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                    />
                    <button
                      onClick={addLanguage}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((language, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {language}
                        <button
                          onClick={() => removeLanguage(language)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Revisar
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Revisão</h2>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Informações Básicas</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Título:</span> {formData.title}</p>
                        <p><span className="font-medium">Tipo:</span> {getTypeLabel(formData.type)}</p>
                        <p><span className="font-medium">Nível:</span> {getLevelLabel(formData.level)}</p>
                        <p><span className="font-medium">Modalidade:</span> {getWorkModeLabel(formData.workMode)}</p>
                        <p><span className="font-medium">Localização:</span> {formData.location}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Detalhes</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        {formData.salaryMin && formData.salaryMax && (
                          <p><span className="font-medium">Salário:</span> {formData.salaryMin} - {formData.salaryMax}</p>
                        )}
                        {formData.experienceYears && (
                          <p><span className="font-medium">Experiência:</span> {formData.experienceYears}</p>
                        )}
                        {formData.education && (
                          <p><span className="font-medium">Escolaridade:</span> {formData.education}</p>
                        )}
                        {formData.skills.length > 0 && (
                          <p><span className="font-medium">Habilidades:</span> {formData.skills.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Antes de publicar</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Revise todas as informações cuidadosamente. Após a publicação, a vaga ficará visível para todos os candidatos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Anterior
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleSubmit(true)}
                      disabled={saving}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Salvar Rascunho
                    </button>
                    <button
                      onClick={() => handleSubmit(false)}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Publicando...' : 'Publicar Vaga'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          {showPreview && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pré-visualização</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{formData.title || 'Título da Vaga'}</h4>
                  <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{formData.location || 'Localização'}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{getTypeLabel(formData.type)}</span>
                  </div>
                  {(formData.salaryMin || formData.salaryMax) && (
                    <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{formData.salaryMin} - {formData.salaryMax}</span>
                    </div>
                  )}
                </div>

                {formData.description && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Descrição</h5>
                    <p className="text-sm text-gray-600 line-clamp-3">{formData.description}</p>
                  </div>
                )}

                {formData.skills.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Habilidades</h5>
                    <div className="flex flex-wrap gap-1">
                      {formData.skills.slice(0, 5).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {formData.skills.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{formData.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}