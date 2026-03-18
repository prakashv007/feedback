import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, getDoc, query, where, updateDoc, deleteDoc, setDoc, doc, onSnapshot } from "firebase/firestore";

// Your web app's Firebase configuration
// REPLACE THIS WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyDFFIVEajdrScWbGkO2Im2IzgsC0hxbqLU",
  authDomain: "aamec-feedback.firebaseapp.com",
  projectId: "aamec-feedback",
  storageBucket: "aamec-feedback.firebasestorage.app",
  messagingSenderId: "766778343735",
  appId: "1:766778343735:web:b7e5fabd3100862a915ab2",
  measurementId: "G-ZPZGBBX3JD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  setDoc,
  doc, 
  onSnapshot 
};
