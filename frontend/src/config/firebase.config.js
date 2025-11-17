// Import Firebase client SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase config (safe on frontend)
const firebaseConfig = {
  apiKey: "AIzaSyBxjX5Xo436MaHQav1vcseMxDJXmljnS9U",
  authDomain: "codequest-200b.firebaseapp.com",
  projectId: "codequest-200b",
  storageBucket: "codequest-200b.firebasestorage.app",
  messagingSenderId: "991275629710",
  appId: "1:991275629710:web:1faed78dc6cd69da3adddf",
  measurementId: "G-WEB9D2JHCZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
