import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';



const firebaseConfig = {
  apiKey: 'AIzaSyD965RWJRBPcDxy3xupB16cLA-qHd1zmfc',
  authDomain: 'cloudcomputing4-e6c6e.firebaseapp.com',
  projectId: 'cloudcomputing4-e6c6e',
  storageBucket: 'cloudcomputing4-e6c6e.firebasestorage.app',
  messagingSenderId: '34191997082',
  appId: '1:34191997082:web:f60e4714ac2ee345b48723',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


