import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2B9jgjFgaM_ACKwFwa2oWiQpEvPDrAtQ",
  authDomain: "circleuno-1f747.firebaseapp.com",
  projectId: "circleuno-1f747",
  storageBucket: "circleuno-1f747.firebasestorage.app",
  messagingSenderId: "335720291536",
  appId: "1:335720291536:web:e0e28fe0362d248c6112d5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
