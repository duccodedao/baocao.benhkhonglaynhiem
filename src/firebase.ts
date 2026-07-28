import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCKJee48VJkuRbXTOoufym9L03lAaMfXpA",
  authDomain: "benhkhonglaynhiem-2026.firebaseapp.com",
  projectId: "benhkhonglaynhiem-2026",
  storageBucket: "benhkhonglaynhiem-2026.firebasestorage.app",
  messagingSenderId: "1026854950010",
  appId: "1:1026854950010:web:7d519f0f12d553449a17c3",
  measurementId: "G-STYBXCSGLJ"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function loginWithFirebaseGoogle() {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logoutFirebase() {
  await firebaseSignOut(auth);
}
