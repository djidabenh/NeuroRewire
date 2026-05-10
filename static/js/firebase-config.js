import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPm51aQAZKIXn3zVX_UDYnQK-usgm8y6o",
  authDomain: "neuro-rewire.firebaseapp.com",
  databaseURL: "https://neuro-rewire-default-rtdb.firebaseio.com",
  projectId: "neuro-rewire",
  storageBucket: "neuro-rewire.firebasestorage.app",
  messagingSenderId: "818790964282",
  appId: "1:818790964282:web:9ff9612f2a247cd3ffa903",
  measurementId: "G-F6D0SCZV80"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);