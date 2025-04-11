import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID
// };

const firebaseConfig = {
  apiKey: "AIzaSyBHTQ8Vtp977aZsrPPWuSL2T5pkJ33h_pM",
  authDomain: "cardiohealth-e95c7.firebaseapp.com",
  projectId: "cardiohealth-e95c7",
  storageBucket: "cardiohealth-e95c7.firebasestorage.app",
  messagingSenderId: "31464873554",
  appId: "1:31464873554:web:ef6275de795ba3e15b498b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);