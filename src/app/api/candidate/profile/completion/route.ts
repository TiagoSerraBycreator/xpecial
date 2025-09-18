import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar dados do usuário e candidato
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        candidate: true
      }
    });

    if (!user || !user.candidate) {
      return NextResponse.json({ error: 'Candidato não encontrado' }, { status: 404 });
    }

    const candidate = user.candidate;

    // Calcular completude do perfil
    const profileFields = [
      { field: 'name', value: user.name, weight: 10 },
      { field: 'email', value: user.email, weight: 10 },
      { field: 'phone', value: candidate.phone, weight: 8 },
      { field: 'city', value: candidate.city, weight: 8 },
      { field: 'state', value: candidate.state, weight: 8 },
      { field: 'dateOfBirth', value: candidate.dateOfBirth, weight: 5 },
      { field: 'description', value: candidate.description, weight: 15 },
      { field: 'aboutMe', value: candidate.aboutMe, weight: 10 },
      { field: 'experience', value: candidate.experience, weight: 15 },
      { field: 'education', value: candidate.education, weight: 10 },
      { field: 'skills', value: candidate.skills, weight: 12 },
      { field: 'languages', value: candidate.languages, weight: 5 },
      { field: 'availability', value: candidate.availability, weight: 5 },
      { field: 'profilePhoto', value: candidate.profilePhoto, weight: 8 },
      { field: 'videoResumeUrl', value: candidate.videoResumeUrl, weight: 10 }
    ];

    let completedWeight = 0;
    let totalWeight = 0;
    const missingFields: string[] = [];
    const completedFields: string[] = [];

    profileFields.forEach(({ field, value, weight }) => {
      totalWeight += weight;
      
      if (value && value.toString().trim() !== '') {
        completedWeight += weight;
        completedFields.push(field);
      } else {
        missingFields.push(field);
      }
    });

    const completion = Math.round((completedWeight / totalWeight) * 100);

    // Mapear nomes dos campos para português
    const fieldNames: Record<string, string> = {
      name: 'Nome completo',
      email: 'Email',
      phone: 'Telefone',
      city: 'Cidade',
      state: 'Estado',
      dateOfBirth: 'Data de nascimento',
      description: 'Descrição profissional',
      aboutMe: 'Sobre mim',
      experience: 'Experiência profissional',
      education: 'Formação acadêmica',
      skills: 'Habilidades',
      languages: 'Idiomas',
      availability: 'Disponibilidade',
      profilePhoto: 'Foto do perfil',
      videoResumeUrl: 'Vídeo currículo'
    };

    const response = {
      completion,
      completedFields: completedFields.length,
      totalFields: profileFields.length,
      missingFields: missingFields.map(field => fieldNames[field] || field),
      suggestions: getMissingFieldSuggestions(missingFields, fieldNames)
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao calcular completude do perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function getMissingFieldSuggestions(missingFields: string[], fieldNames: Record<string, string>): string[] {
  const suggestions: string[] = [];
  
  if (missingFields.includes('description')) {
    suggestions.push('Adicione uma descrição profissional para destacar seu perfil');
  }
  
  if (missingFields.includes('experience')) {
    suggestions.push('Inclua sua experiência profissional para aumentar suas chances');
  }
  
  if (missingFields.includes('skills')) {
    suggestions.push('Liste suas principais habilidades técnicas e comportamentais');
  }
  
  if (missingFields.includes('profilePhoto')) {
    suggestions.push('Adicione uma foto profissional ao seu perfil');
  }
  
  if (missingFields.includes('videoResumeUrl')) {
    suggestions.push('Grave um vídeo currículo para se destacar dos demais candidatos');
  }
  
  if (missingFields.includes('education')) {
    suggestions.push('Informe sua formação acadêmica');
  }
  
  if (missingFields.includes('phone')) {
    suggestions.push('Adicione seu telefone para facilitar o contato');
  }
  
  if (missingFields.includes('city') || missingFields.includes('state')) {
    suggestions.push('Complete sua localização para receber vagas da sua região');
  }

  return suggestions.slice(0, 3); // Retornar apenas as 3 principais sugestões
}