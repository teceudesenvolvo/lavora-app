import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Configurações do seu app Firebase
// Você pode encontrar esses dados no Console do Firebase > Configurações do Projeto
const firebaseConfig = {
  apiKey: "AIzaSyCL6coKgvGU7k1fOXvuOKEdDBpjrBnEwj8",
  authDomain: "lavoro-servicos-c10fd.firebaseapp.com",
  databaseURL: "https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com",
  projectId: "lavoro-servicos-c10fd",
  storageBucket: "lavoro-servicos-c10fd.firebasestorage.app",
  messagingSenderId: "11458991995",
  appId: "1:11458991995:web:f6a0ea46e3d1530427cfde",
  measurementId: "G-2G3W4YW4TF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };