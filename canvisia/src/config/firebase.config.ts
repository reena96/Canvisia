// Firebase Configuration
// This will be filled in PR #2 after creating Firebase project

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase will be initialized in PR #2
// export const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const firestore = getFirestore(app);
// export const rtdb = getDatabase(app);
