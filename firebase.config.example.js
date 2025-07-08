// Copia este archivo a src/firebase/config.ts y actualiza con tus credenciales de Firebase

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;

// Alternativa: Usar variables de entorno (crea un archivo .env)
// VITE_FIREBASE_API_KEY=tu_api_key
// VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
// VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
// VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
// VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
// VITE_FIREBASE_APP_ID=tu_app_id 