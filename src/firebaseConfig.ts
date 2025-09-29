// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-ZN_OENRObgUwHA-Yk7yEAx994Io6m3U",
  authDomain: "timetable-c374e.firebaseapp.com",
  projectId: "timetable-c374e",
  storageBucket: "timetable-c374e.firebasestorage.app",
  messagingSenderId: "771455054653",
  appId: "1:771455054653:web:f5e4dcbf91c0cc8774cb54",
  measurementId: "G-CV9J6TZ4P2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
