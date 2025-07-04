import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WeekRecord } from '../types';

interface WeekNavigationProps {
  currentWeek: WeekRecord | null;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({ currentWeek }) => {
  if (!currentWeek) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const startDate = new Date(currentWeek.startDate);
  const endDate = new Date(currentWeek.endDate);
  
  const formatDateRange = () => {
    const start = format(startDate, 'dd MMM', { locale: es });
    const end = format(endDate, 'dd MMM', { locale: es });
    return `${start} al ${end}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <button
          className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          disabled // TODO: Implement previous week navigation
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Anterior
        </button>

        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <div className="text-center">
            <p className="font-semibold text-gray-900">
              Semana {currentWeek.weekNumber} - {currentWeek.year}
            </p>
            <p className="text-sm text-gray-600 capitalize">
              {formatDateRange()}
            </p>
          </div>
        </div>

        <button
          className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          disabled // TODO: Implement next week navigation
        >
          Siguiente
          <ChevronRight className="h-5 w-5 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default WeekNavigation; 