import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBAyHwucDmItnsi4iYbRCxnfPnTmEPqqZw",
    authDomain: "coachfit-8c053.firebaseapp.com",
    projectId: "coachfit-8c053",
    storageBucket: "coachfit-8c053.firebasestorage.app",
    messagingSenderId: "528433974371",
    appId: "1:528433974371:web:d1f0f042ebabef8704bc56",
    measurementId: "G-SZS977EFQK"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
auth.languageCode = 'pt-BR';
const provider = new GoogleAuthProvider();
const onAuth = onAuthStateChanged;
const db = getFirestore(app);

export { auth, provider, signInWithPopup, onAuth, db, collection, addDoc, query, where, getDocs };