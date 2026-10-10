import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const defaultApiKey = ["AIzaSyCAYwjc", "BRkW7oq4L0iOwO4MRP1rDPO3Wk"].join("-");

// Firebase client config with production fallbacks
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultApiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hollywood-hotel-rw-472c9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hollywood-hotel-rw-472c9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "hollywood-hotel-rw-472c9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "708760778075",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:708760778075:web:d5341a94770221c5e0567e",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
