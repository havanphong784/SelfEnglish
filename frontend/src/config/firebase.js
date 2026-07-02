// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Thay thế bằng config thực tế từ Firebase Console của bạn
const firebaseConfig = {
  apiKey: "AIzaSyD1nr8Ie_txAf9Rc5g7PV-sKYxJRrJZZTU",
  authDomain: "selfenglish-9379d.firebaseapp.com",
  projectId: "selfenglish-9379d",
  storageBucket: "selfenglish-9379d.firebasestorage.app",
  messagingSenderId: "838368333428",
  appId: "1:838368333428:web:07f7cd57a7bff906370b21",
  measurementId: "G-WTDV0CKQFR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
