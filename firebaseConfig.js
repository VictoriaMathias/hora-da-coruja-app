
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA1GGXfNJDVdL9TrAY_STsJW282OjS4GHA",
  authDomain: "horadacorujaapp.firebaseapp.com",
  projectId: "horadacorujaapp",
  storageBucket: "horadacorujaapp.firebasestorage.app",
  messagingSenderId: "630392912897",
  appId: "1:630392912897:web:7849cef2422ee61f391400",
  measurementId: "G-BQEDZXC71N"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);