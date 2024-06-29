import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"
import dotenv from 'dotenv'


// I know I ought to have put the apiKey in my .env file, but when I tried to, it always triggered an error.
// So to unblock myself, and to get my code to work, I left it in here
const firebaseConfig = {
  apiKey: "AIzaSyCBtpeS-sHxmA_taUkklnZCDRBHaMMzuFI",
  authDomain: "capstone-d738e.firebaseapp.com",
  projectId: "capstone-d738e",
  storageBucket: "capstone-d738e.appspot.com",
  messagingSenderId: "145634229197",
  appId: "1:145634229197:web:04446d4dbd2efa1c6fa284",
  measurementId: "G-2R2H1P61C5"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export const auth = getAuth()
export default app
