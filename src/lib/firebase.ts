import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  MultiFactorResolver,
  MultiFactorAssertion,
  RecaptchaVerifier
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Use import.meta.glob to optionally import the config file without top-level await
const configFiles = import.meta.glob('../../firebase-applet-config.json', { eager: true });
const configFromJson = (configFiles['../../firebase-applet-config.json'] as any)?.default;

// Use environment variables with fallback to firebase-applet-config.json
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || configFromJson?.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || configFromJson?.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || configFromJson?.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || configFromJson?.authDomain,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || configFromJson?.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || configFromJson?.messagingSenderId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || configFromJson?.measurementId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use databaseId from environment or JSON
const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || configFromJson?.firestoreDatabaseId;
export const db = getFirestore(app, databaseId);

const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || configFromJson?.storageBucket;
export const storage = getStorage(app, storageBucket);

export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier
};
export type { User, MultiFactorResolver, MultiFactorAssertion };
