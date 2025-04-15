import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBHTQ8Vtp977aZsrPPWuSL2T5pkJ33h_pM",
  authDomain: "cardiohealth-e95c7.firebaseapp.com",
  projectId: "cardiohealth-e95c7",
  storageBucket: "cardiohealth-e95c7.appspot.com", // Fixed storage bucket
  messagingSenderId: "31464873554",
  appId: "1:31464873554:web:ef6275de795ba3e15b498b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);