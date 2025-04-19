import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwsXDV2lo1Z2Qqx2x8qBTSiN4cU-3HjEU",
  authDomain: "projex-8c0c0.firebaseapp.com",
  projectId: "projex-8c0c0",
  storageBucket: "projex-8c0c0.firebasestorage.app",
  messagingSenderId: "216071139195",
  appId: "1:216071139195:web:bd24eabf2c423e6856d7de",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  auth,
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
};
