import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyChbHhWx-aMy4830-mXa9IcYgW4aBXSMFw",
  authDomain: "admin-eb1e1.firebaseapp.com",
  projectId: "admin-eb1e1",
  storageBucket: "admin-eb1e1.firebasestorage.app",
  messagingSenderId: "150618501590",
  appId: "1:150618501590:web:1e2e7fa2d71f6862fc7477"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence failed: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence not available in this browser');
  }
});