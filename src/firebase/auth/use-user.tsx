'use client';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, DocumentData, FirestoreError } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth, useFirestore } from '..';
import type { UserProfile } from '@/lib/types';

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      
      // Cancel any previous profile subscription
      unsubscribeProfile();

      if (authUser && db) {
        setLoading(true); // Start loading profile for the new user
        const userDocRef = doc(db, 'users', authUser.uid);
        unsubscribeProfile = onSnapshot(
          userDocRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setUserProfile({ id: snapshot.id, ...snapshot.data() } as UserProfile);
            } else {
              setUserProfile(null);
            }
            setLoading(false); // Loading is done when profile is fetched
          },
          (error: FirestoreError) => {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
            setLoading(false); // Also done on error
          }
        );
      } else {
        // No authUser, so no profile to fetch. Loading is complete.
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
        unsubscribeAuth();
        unsubscribeProfile();
    };
  }, [auth, db]);

  return { user, userProfile, loading };
}
