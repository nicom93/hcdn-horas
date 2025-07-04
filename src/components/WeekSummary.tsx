import React from 'react';
import { Clock, CheckCircle, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import type { WeekRecord } from '../types';

interface WeekSummaryProps {
  currentWeek: WeekRecord | null;
}

const WeekSummary: React.FC<WeekSummaryProps> = ({ currentWeek }) => {
  if (!currentWeek) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round((currentWeek.totalHours / 35) * 100);
  const dailyAverage = currentWeek.completedDays > 0 ? currentWeek.totalHours / currentWeek.completedDays : 0;
  const hoursRemaining = Math.max(0, 35 - currentWeek.totalHours);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <TrendingUp className="h-6 w-6 text-green-500 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Resumen Semanal</h2>
          <p className="text-gray-600">
            Semana {currentWeek.weekNumber} - {currentWeek.year}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso Semanal</span>
          <span className="text-sm text-gray-500">{progressPercentage}% completado</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              progressPercentage >= 100 ? 'bg-green-500' : 
              progressPercentage >= 70 ? 'bg-blue-500' : 
              'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {currentWeek.totalHours}
              </p>
              <p className="text-sm text-blue-600">Horas Trabajadas</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(dailyAverage * 10) / 10}
              </p>
              <p className="text-sm text-green-600">Horas Promedio</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {currentWeek.completedDays}
              </p>
              <p className="text-sm text-purple-600">Días Completados</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-red-600">
                {currentWeek.absentDays}
              </p>
              <p className="text-sm text-red-600">Días Ausentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Remaining Hours Alert */}
      {hoursRemaining > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Promedio necesario por día restante:
              </p>
              <p className="text-lg font-bold text-yellow-600">
                {(hoursRemaining / (5 - currentWeek.completedDays) || 0).toFixed(1)} horas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Goal Achievement */}
      {progressPercentage >= 100 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-sm font-medium text-green-800">
              ¡Felicitaciones! Has completado tu objetivo semanal de 35 horas.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm font-medium text-blue-800">
              Te faltan {hoursRemaining} horas para completar tu objetivo semanal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekSummary; 