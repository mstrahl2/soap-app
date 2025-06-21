// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPWexadPG6Nv5pcrM9W22rpS5Ji_2yukc",
  authDomain: "soap-app-39cca.firebaseapp.com",
  projectId: "soap-app-39cca",
  storageBucket: "soap-app-39cca.appspot.com",
  messagingSenderId: "658479056410",
  appId: "1:658479056410:web:93eb5dc61871fe4509f3a3"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };