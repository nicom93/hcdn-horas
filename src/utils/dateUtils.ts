import { format, startOfWeek, endOfWeek, getWeek, getYear, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WeekStats } from '../types';

export const REQUIRED_WEEKLY_HOURS = 35;
export const MINIMUM_DAILY_HOURS = 5;
export const MAXIMUM_DAILY_HOURS = 9;
export const REMOTE_HOLIDAY_HOURS = 7;
export const WORKING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const getCurrentWeekInfo = (date: Date = new Date()) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
  
  return {
    weekNumber: getWeek(date, { weekStartsOn: 1 }),
    year: getYear(date),
    startDate: formatDate(weekStart),
    endDate: formatDate(weekEnd),
    weekStart,
    weekEnd
  };
};

export const calculateHoursWorked = (entryTime: string, exitTime: string): number => {
  if (!entryTime || !exitTime) return 0;
  
  const [entryHour, entryMin] = entryTime.split(':').map(Number);
  const [exitHour, exitMin] = exitTime.split(':').map(Number);
  
  const entryMinutes = entryHour * 60 + entryMin;
  const exitMinutes = exitHour * 60 + exitMin;
  
  const totalMinutes = exitMinutes - entryMinutes;
  const totalHours = totalMinutes / 60;
  
  // Apply minimum and maximum constraints
  if (totalHours < MINIMUM_DAILY_HOURS) return 0;
  if (totalHours > MAXIMUM_DAILY_HOURS) return MAXIMUM_DAILY_HOURS;
  
  return Math.round(totalHours * 100) / 100; // Round to 2 decimal places
};

export const calculateWeekStats = (totalHours: number, completedDays: number, absentDays: number): WeekStats => {
  const remainingHours = Math.max(0, REQUIRED_WEEKLY_HOURS - totalHours);
  const progressPercentage = Math.round((totalHours / REQUIRED_WEEKLY_HOURS) * 100);
  const dailyAverage = completedDays > 0 ? totalHours / completedDays : 0;
  
  return {
    totalHours,
    remainingHours,
    completedDays,
    absentDays,
    progressPercentage,
    dailyAverage: Math.round(dailyAverage * 100) / 100
  };
};

export const isToday = (date: string): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return isSameDay(today, checkDate);
};

export const getWeekDays = (startDate: string) => {
  const start = new Date(startDate);
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push({
      date: formatDate(date),
      dayName: format(date, 'EEEE', { locale: es }),
      dayNumber: format(date, 'd'),
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    });
  }
  
  return days;
};

export const formatHours = (hours: number): string => {
  if (hours === 0) return '0h';
  if (hours % 1 === 0) return `${hours}h`;
  return `${hours.toFixed(1)}h`;
};

// Función para obtener la fecha actual en zona horaria local
export const getTodayLocalDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}; 