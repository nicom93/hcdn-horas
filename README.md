# Tracker de Horas Semanales

Una aplicación web para trackear horas semanales de trabajo, desarrollada con React + TypeScript y Firebase.

## Características

- ✅ Registro de horas de entrada y salida
- ✅ Cálculo automático de horas trabajadas
- ✅ Días feriados y remotos (7 horas automáticas)
- ✅ Resumen semanal con progreso
- ✅ Objetivo de 35 horas semanales
- ✅ Persistencia de datos en Firebase
- ✅ Interfaz moderna con Tailwind CSS

## Configuración

### 1. Clonar el proyecto

```bash
git clone <url-del-repo>
cd hcdn-horas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Firestore Database en modo de prueba
3. Obtener la configuración del proyecto desde Project Settings > General > Your apps
4. **Opción 1**: Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

**Opción 2**: Actualizar directamente `src/firebase/config.ts` con tus credenciales (ver `firebase.config.example.js`)

**Importante**: Configurar las reglas de Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Para desarrollo - cambiar en producción
    }
  }
}
```

### 4. Ejecutar la aplicación

```bash
npm run dev
```

## Uso

1. **Registro de horas**: Selecciona la hora de entrada y salida
2. **Días especiales**: Usa los botones para marcar días remotos o feriados
3. **Resumen semanal**: Visualiza tu progreso y estadísticas
4. **Navegación**: Navega entre diferentes semanas

## Reglas de negocio

- Mínimo 35 horas semanales
- Mínimo 5 horas diarias para contar como presente
- Máximo 9 horas diarias para el cálculo
- Días feriados/remotos = 7 horas automáticas

## Tecnologías

- React 18
- TypeScript
- Tailwind CSS
- Firebase Firestore
- Vite
- date-fns
- Lucide React

## Estructura del proyecto

```
src/
├── components/          # Componentes React
├── firebase/           # Configuración Firebase
├── services/           # Servicios de datos
├── types/              # Definiciones TypeScript
├── utils/              # Utilidades y helpers
└── App.tsx             # Componente principal
```
