import React, { useState, useEffect } from 'react';
import { History, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { firebaseService } from '../services/firebaseService';
import type { WeekRecord } from '../types';

interface WeekHistoryProps {
  currentWeekId?: string;
  userId: string;
}

const WeekHistory: React.FC<WeekHistoryProps> = ({ currentWeekId, userId }) => {
  const [weeks, setWeeks] = useState<WeekRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadWeekHistory();
  }, []);

  const loadWeekHistory = async () => {
    try {
      setLoading(true);
      const allWeeks = await firebaseService.getAllWeeks(userId);
      // Filter out current week if provided
      const filteredWeeks = currentWeekId 
        ? allWeeks.filter(week => week.id !== currentWeekId)
        : allWeeks;
      setWeeks(filteredWeeks);
    } catch (err) {
      setError('Error al cargar el historial de semanas');
      console.error('Error loading week history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatWeekRange = (startDate: string, endDate: string) => {
    const start = format(new Date(startDate), 'dd MMM', { locale: es });
    const end = format(new Date(endDate), 'dd MMM yyyy', { locale: es });
    return `${start} - ${end}`;
  };

  const getProgressColor = (totalHours: number) => {
    const percentage = (totalHours / 35) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const getProgressBg = (totalHours: number) => {
    const percentage = (totalHours / 35) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <History className="h-6 w-6 text-gray-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Historial de Semanas</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <History className="h-6 w-6 text-red-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Historial de Semanas</h2>
        </div>
        <div className="text-center py-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <History className="h-6 w-6 text-gray-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Historial de Semanas</h2>
        </div>
        <div className="text-center py-8">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No hay semanas guardadas anteriormente</p>
        </div>
      </div>
    );
  }

  const displayWeeks = isExpanded ? weeks : weeks.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <History className="h-6 w-6 text-gray-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Historial de Semanas</h2>
        </div>
        <span className="text-sm text-gray-500">{weeks.length} semanas</span>
      </div>

      <div className="space-y-3">
        {displayWeeks.map((week) => (
          <div key={week.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-medium text-gray-900">
                  Semana {week.weekNumber} - {week.year}
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {formatWeekRange(week.startDate, week.endDate)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${getProgressColor(week.totalHours)}`}>
                  {week.totalHours}h
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round((week.totalHours / 35) * 100)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-gray-600">{week.completedDays} días</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-gray-600">{week.absentDays} ausentes</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBg(week.totalHours)}`}
                style={{ width: `${Math.min((week.totalHours / 35) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {weeks.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center mx-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            {isExpanded ? (
              <>
                Ver menos <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Ver más ({weeks.length - 5} más) <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default WeekHistory; 