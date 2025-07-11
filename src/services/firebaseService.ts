import { db } from '../firebase/config';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  limit
} from 'firebase/firestore';
import type { WeekRecord, DayRecord } from '../types';

const WEEK_COLLECTION = 'weeks';
const DAY_COLLECTION = 'days';

export const firebaseService = {
  // Week operations
  async createWeek(weekData: Omit<WeekRecord, 'id'>, userId: string): Promise<string> {
    const weekWithUser = { ...weekData, userId };
    const docRef = await addDoc(collection(db, WEEK_COLLECTION), weekWithUser);
    return docRef.id;
  },

  async updateWeek(weekId: string, weekData: Partial<WeekRecord>): Promise<void> {
    const weekRef = doc(db, WEEK_COLLECTION, weekId);
    await updateDoc(weekRef, weekData);
  },

  async getWeek(weekId: string): Promise<WeekRecord | null> {
    const weekRef = doc(db, WEEK_COLLECTION, weekId);
    const weekSnap = await getDoc(weekRef);
    
    if (weekSnap.exists()) {
      return { id: weekSnap.id, ...weekSnap.data() } as WeekRecord;
    }
    return null;
  },

  async getCurrentWeek(year: number, weekNumber: number, userId: string): Promise<WeekRecord | null> {
    const q = query(
      collection(db, WEEK_COLLECTION),
      where('year', '==', year),
      where('weekNumber', '==', weekNumber),
      where('userId', '==', userId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as WeekRecord;
    }
    return null;
  },

  async getAllWeeks(userId: string): Promise<WeekRecord[]> {
    // Consulta filtrada por usuario
    const q = query(
      collection(db, WEEK_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const weeks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WeekRecord[];
    
    // Ordenar en el cliente
    return weeks.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year; // Año descendente
      }
      return b.weekNumber - a.weekNumber; // Semana descendente
    });
  },

  // Day operations
  async createDay(dayData: Omit<DayRecord, 'id'>, userId: string): Promise<string> {
    const dayWithUser = { ...dayData, userId };
    const docRef = await addDoc(collection(db, DAY_COLLECTION), dayWithUser);
    return docRef.id;
  },

  async updateDay(dayId: string, dayData: Partial<DayRecord>): Promise<void> {
    const dayRef = doc(db, DAY_COLLECTION, dayId);
    await updateDoc(dayRef, dayData);
  },

  async getDay(dayId: string): Promise<DayRecord | null> {
    const dayRef = doc(db, DAY_COLLECTION, dayId);
    const daySnap = await getDoc(dayRef);
    
    if (daySnap.exists()) {
      return { id: daySnap.id, ...daySnap.data() } as DayRecord;
    }
    return null;
  },

  async getDayByDate(date: string, userId: string): Promise<DayRecord | null> {
    const q = query(
      collection(db, DAY_COLLECTION),
      where('date', '==', date),
      where('userId', '==', userId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as DayRecord;
    }
    return null;
  },

  async deleteDay(dayId: string): Promise<void> {
    const dayRef = doc(db, DAY_COLLECTION, dayId);
    await deleteDoc(dayRef);
  }
}; 