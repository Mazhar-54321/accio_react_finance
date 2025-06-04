import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyBhW4TTz87-52bdUpp6qNACltWHeA0JaRk",
    authDomain: "finance-tracker-e1723.firebaseapp.com",
    projectId: "finance-tracker-e1723",
    storageBucket: "finance-tracker-e1723.firebasestorage.app",
    messagingSenderId: "866732798445",
    appId: "1:866732798445:web:490fd8e210475941be77e4",
    measurementId: "G-2DR6B12ZQN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
export { db, auth,googleProvider };
