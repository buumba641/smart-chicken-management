import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD8isRc2dz61A3QQUGiPMDEj2Nk6dD9ufI',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'smart-chicken-management.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'smart-chicken-management',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'smart-chicken-management.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '983692963534',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:983692963534:web:bc1da665b47fed2f886a9f',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-EBSQ3P59LS',
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export { firebaseConfig }
