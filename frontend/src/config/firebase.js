import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD1nr8Ie_txAf9Rc5g7PV-sKYxJRrJZZTU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "selfenglish-9379d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "selfenglish-9379d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "selfenglish-9379d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "838368333428",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:838368333428:web:07f7cd57a7bff906370b21",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WTDV0CKQFR",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
