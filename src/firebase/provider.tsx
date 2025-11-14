'use client';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react';

const FirebaseContext = createContext<{
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} | null>(null);

export function FirebaseProvider({
  children,
  app,
  auth,
  firestore,
}: PropsWithChildren<{ app: FirebaseApp; auth: Auth; firestore: Firestore }>) {
  const contextValue = useMemo(
    () => ({
      app,
      auth,
      firestore,
    }),
    [app, auth, firestore]
  );
  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => useFirebase().app;
export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
