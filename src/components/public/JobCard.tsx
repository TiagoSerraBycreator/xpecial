'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Briefcase,
  Calendar,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location: string;
  workMode: string;
  salaryRange?: string;
  sector?: string;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface JobCardProps {
  job: Job;
}

const workModeLabels: Record<string, string> = {
  REMOTE: 'Remoto',
  ONSITE: 'Presencial',
  HYBRID: 'Híbrido'
};

const workModeColors: Record<string, string> = {
  REMOTE: 'bg-green-100 text-green-800',
  ONSITE: 'bg-blue-100 text-blue-800',
  HYBRID: 'bg-purple-100 text-purple-800'
};

export default function JobCard({ job }: JobCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Publicada hoje';
    } else if (diffDays === 2) {
      return 'Publicada ontem';
    } else if (diffDays <= 7) {
      return `Publicada há ${diffDays - 1} dias`;
    } else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Publicada há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const workModeLabel = workModeLabels[job.workMode] || job.workMode;
  const workModeColor = workModeColors[job.workMode] || 'bg-gray-100 text-gray-800';

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
              {job.title}
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
              
              <Badge className={`${workModeColor} border-0`}>
                {workModeLabel}
              </Badge>
              
              {job.sector && (
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{job.sector}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Descrição */}
          <div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {truncateText(job.description, 200)}
            </p>
          </div>
          
          {/* Requisitos (se houver) */}
          {job.requirements && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Requisitos:</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {truncateText(job.requirements, 150)}
              </p>
            </div>
          )}
          
          {/* Informações adicionais */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {job.salaryRange && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                <span className="font-medium text-green-700">{job.salaryRange}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>
                {job.applicationsCount} {job.applicationsCount === 1 ? 'candidatura' : 'candidaturas'}
              </span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(job.createdAt)}</span>
            </div>
          </div>
          
          {/* Botão de ação */}
          <div className="pt-2">
            <Link href={`/vagas/${job.id}`} className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <span>Ver detalhes da vaga</span>
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}