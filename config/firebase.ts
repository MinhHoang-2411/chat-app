// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHSBlmYOXw2ZD_-l89Op0fPKsS0AP8ak8",
  authDomain: "chat-app-5f499.firebaseapp.com",
  projectId: "chat-app-5f499",
  storageBucket: "chat-app-5f499.appspot.com",
  messagingSenderId: "1041850381411",
  appId: "1:1041850381411:web:efe3bc571509576eae7456",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export {app, db, auth, provider};
