import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBoUzorQTyh8t5mkpvygExujpY0QtXs1oU",
  authDomain: "learningmanagementsystem-fa968.firebaseapp.com",
  projectId: "learningmanagementsystem-fa968",
  storageBucket: "learningmanagementsystem-fa968.appspot.com",
  messagingSenderId: "561927091463",
  appId: "1:561927091463:web:54dacd0cc4bcea7b8ac1a2",
  measurementId: "G-2P1V2CJ88B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);

