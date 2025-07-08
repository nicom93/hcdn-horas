import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { User } from '../types';

const USERS_COLLECTION = 'users';

export const authService = {
  // Crear nueva cuenta
  async register(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Actualizar el perfil con el nombre
      await updateProfile(firebaseUser, { displayName });
      
      // Crear documento del usuario en Firestore
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), userData);
      
      return userData;
    } catch (error) {
      const errorCode = (error as { code?: string }).code || 'unknown';
      throw new Error(this.getErrorMessage(errorCode));
    }
  },

  // Iniciar sesión
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Obtener datos del usuario desde Firestore
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
      
      if (userDoc.exists()) {
        return userDoc.data() as User;
      } else {
        // Si no existe el documento, crearlo con los datos básicos
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || '',
          createdAt: new Date()
        };
        
        await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), userData);
        return userData;
      }
    } catch (error) {
      const errorCode = (error as { code?: string }).code || 'unknown';
      throw new Error(this.getErrorMessage(errorCode));
    }
  },

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch {
      throw new Error('Error al cerrar sesión');
    }
  },

  // Obtener usuario actual
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  // Suscribirse a cambios de autenticación
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Convertir mensajes de error de Firebase a español
  getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este email ya está registrado';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'auth/invalid-email':
        return 'El email no tiene un formato válido';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada';
      case 'auth/user-not-found':
        return 'No existe una cuenta con este email';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/invalid-credential':
        return 'Email o contraseña incorrectos';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde';
      default:
        return 'Error de autenticación. Intenta nuevamente';
    }
  }
}; 