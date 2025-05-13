
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  enableMultiTabIndexedDbPersistence,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC_JYqkizXOltYMMgqp5sMJIvbYYcK09yE",
  authDomain: "smartcloset-ac08a.firebaseapp.com",
  projectId: "smartcloset-ac08a",
  storageBucket: "smartcloset-ac08a.firebasestorage.app",
  messagingSenderId: "368150102391",
  appId: "1:368150102391:web:85c6eccda8ba10f5ec6172",
  measurementId: "G-K5W1D08SQE"
};

let app;
let auth;
let db;
let storage;
let analytics;

const initializeFirebase = async () => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

      try {
        // Try multi-tab persistence first
        await enableMultiTabIndexedDbPersistence(db);
      } catch (multiTabError) {
        console.warn('Multi-tab persistence failed, falling back to single-tab persistence:', multiTabError);
        
        try {
          // Fall back to single-tab persistence
          await enableIndexedDbPersistence(db, {
            cacheSizeBytes: CACHE_SIZE_UNLIMITED
          });
        } catch (singleTabError) {
          if (singleTabError.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
          } else if (singleTabError.code === 'unimplemented') {
            console.warn('The current browser doesn\'t support persistence');
          }
        }
      }
    }
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
};

// Initialize Firebase immediately
initializeFirebase().catch(console.error);

export { app as firebaseApp, auth, db, storage, analytics };
