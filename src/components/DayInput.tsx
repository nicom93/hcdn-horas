import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Calendar, Home, Sun, CheckCircle } from 'lucide-react';
import type { DayRecord } from '../types';

interface DayInputProps {
  selectedDate: string;
  dayRecord: DayRecord | null;
  onTimeUpdate: (entryTime: string, exitTime: string) => void;
  onSpecialDay: (type: 'holiday' | 'remote') => void;
}

const DayInput: React.FC<DayInputProps> = ({
  selectedDate,
  dayRecord,
  onTimeUpdate,
  onSpecialDay
}) => {
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');

  useEffect(() => {
    if (dayRecord) {
      setEntryTime(dayRecord.entryTime);
      setExitTime(dayRecord.exitTime);
    } else {
      setEntryTime('');
      setExitTime('');
    }
  }, [dayRecord]);

  const handleTimeSubmit = () => {
    if (entryTime && exitTime) {
      onTimeUpdate(entryTime, exitTime);
    }
  };

  const handleSpecialDayClick = (type: 'holiday' | 'remote') => {
    onSpecialDay(type);
  };

  const dateObj = new Date(selectedDate);
  const isValidDate = !isNaN(dateObj.getTime());
  if (!isValidDate) {
    return <div className="bg-white rounded-lg shadow-lg p-6 text-red-600">Fecha inválida</div>;
  }

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const dayName = format(dateObj, 'EEEE', { locale: es });
  const dayNumber = format(dateObj, 'd');

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Calendar className="h-6 w-6 text-blue-500 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Registrar Horas</h2>
          <p className="text-gray-600 capitalize">
            {dayName} {dayNumber}
            {isToday && <span className="ml-2 text-green-600 font-medium">Hoy</span>}
          </p>
        </div>
      </div>

      {dayRecord && (dayRecord.isHoliday || dayRecord.isRemote) ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            {dayRecord.isHoliday ? (
              <Sun className="h-8 w-8 text-yellow-500" />
            ) : (
              <Home className="h-8 w-8 text-blue-500" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {dayRecord.isHoliday ? 'Día Feriado' : 'Día Remoto'}
          </h3>
          <p className="text-gray-600 mb-4">
            Se han registrado 7 horas automáticamente
          </p>
          <div className="flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-600 font-medium">7.0 horas completadas</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Entrada
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Salida
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="time"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleTimeSubmit}
            disabled={!entryTime || !exitTime}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Registrar Horas
          </button>

          <div className="flex space-x-3">
            <button
              onClick={() => handleSpecialDayClick('remote')}
              className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-100 font-medium transition-colors flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Día Remoto
            </button>
            <button
              onClick={() => handleSpecialDayClick('holiday')}
              className="flex-1 bg-yellow-50 text-yellow-600 py-2 px-4 rounded-md hover:bg-yellow-100 font-medium transition-colors flex items-center justify-center"
            >
              <Sun className="h-4 w-4 mr-2" />
              Día Feriado
            </button>
          </div>

          {dayRecord && dayRecord.totalHours > 0 && (
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700 font-medium">
                  {dayRecord.totalHours} horas registradas
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DayInput; 