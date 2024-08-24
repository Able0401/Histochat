// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApSjdiVkGQIB5QdTDXyTbWNL7REpA3RzY",
  authDomain: "histochat-bbf8e.firebaseapp.com",
  projectId: "histochat-bbf8e",
  storageBucket: "histochat-bbf8e.appspot.com",
  messagingSenderId: "702767448466",
  appId: "1:702767448466:web:9ee824478e5e69e564814b",
  measurementId: "G-X4NMSKYG2N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
