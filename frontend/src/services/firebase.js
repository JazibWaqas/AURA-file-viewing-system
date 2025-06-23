import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig= {
apiKey: "AIzaSyDP-0zAhfsiBsYSYTZ2yis0ZzOXHd6kf7Q",
authDomain: "auraxkhidmat-f4c73.firebaseapp.com",
projectId: "auraxkhidmat-f4c73",
storageBucket: "auraxkhidmat-f4c73.firebasestorage.app",
messagingSenderId: "267970086214",
appId: "1:267970086214:web:0fac2101fd29f55a4d9147",
measurementId: "G-C580KTG8P5"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth); 