import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD-_w6b2HnuvlTpwscggZEPV-rUF0_rMdA",
  authDomain: "hcdn-horas.firebaseapp.com",
  projectId: "hcdn-horas",
  storageBucket: "hcdn-horas.firebasestorage.app",
  messagingSenderId: "707874092128",
  appId: "1:707874092128:web:b544c0609902eb56513f05"
};

console.log('Inicializando Firebase con configuración:', firebaseConfig);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('Firebase inicializado correctamente');

export { db, auth };
export default app; 