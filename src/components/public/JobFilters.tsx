'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

interface JobFiltersProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const periodOptions = [
  { value: 'all', label: 'Todo período', icon: Calendar },
  { value: '7', label: 'Últimos 7 dias', icon: Clock },
  { value: '30', label: 'Últimos 30 dias', icon: Clock },
  { value: '60', label: 'Últimos 60 dias', icon: Clock },
  { value: '180', label: 'Últimos 180 dias', icon: Clock },
  { value: 'year', label: 'Este ano', icon: Calendar },
];

export default function JobFilters({ selectedPeriod, onPeriodChange }: JobFiltersProps) {
  return (
    <Card className="bg-gray-50 border-0">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">Filtrar por período</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {periodOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedPeriod === option.value;
              
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onPeriodChange(option.value)}
                  className={`
                    flex items-center space-x-2 transition-all duration-200
                    ${isSelected 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </Button>
              );
            })}
          </div>
          
          {selectedPeriod !== 'all' && (
            <div className="text-xs text-gray-500 mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                Filtro ativo: {periodOptions.find(p => p.value === selectedPeriod)?.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}