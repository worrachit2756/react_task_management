import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBD_YJafZIEgANvYHj4RpwCCd9M3XLNNHM",
  authDomain: "myreact-64fa1.firebaseapp.com",
  projectId: "myreact-64fa1",
  storageBucket: "myreact-64fa1.appspot.com",
  messagingSenderId: "865813545150",
  appId: "1:865813545150:web:efb075670839291f641eef",
  measurementId: "G-M5S64664EX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };