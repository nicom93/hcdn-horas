export interface DayRecord {
  id: string;
  date: string; 
  entryTime: string; 
  exitTime: string; 
  totalHours: number;
  isHoliday: boolean;
  isRemote: boolean;
  isComplete: boolean;
  userId: string; 
}

export interface WeekRecord {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string; 
  endDate: string; 
  totalHours: number;
  completedDays: number;
  absentDays: number;
  remainingHours: number;
  days: DayRecord[];
  userId: string;
}

export interface WeekStats {
  totalHours: number;
  remainingHours: number;
  completedDays: number;
  absentDays: number;
  progressPercentage: number;
  dailyAverage: number;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
} 