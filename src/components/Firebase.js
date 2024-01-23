import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFD8Zic41xeC3VKx7wNHuEKNL-AbIQEmI",
  authDomain: "chat-app-b9c18.firebaseapp.com",
  projectId: "chat-app-b9c18",
  storageBucket: "chat-app-b9c18.appspot.com",
  messagingSenderId: "864637309496",
  appId: "1:864637309496:web:ea416d4a82a2bb3b308ccd",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
