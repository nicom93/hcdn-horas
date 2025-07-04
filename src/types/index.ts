export interface DayRecord {
  id: string;
  date: string; // YYYY-MM-DD format
  entryTime: string; // HH:MM format
  exitTime: string; // HH:MM format
  totalHours: number;
  isHoliday: boolean;
  isRemote: boolean;
  isComplete: boolean;
}

export interface WeekRecord {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  totalHours: number;
  completedDays: number;
  absentDays: number;
  remainingHours: number;
  days: DayRecord[];
}

export interface WeekStats {
  totalHours: number;
  remainingHours: number;
  completedDays: number;
  absentDays: number;
  progressPercentage: number;
  dailyAverage: number;
} 