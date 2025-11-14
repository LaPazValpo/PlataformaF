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
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!authUser) {
        // Si no hay usuario de autenticación, no hay perfil y la carga ha terminado.
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (user && db) {
      // Si hay un usuario autenticado, escuchamos cambios en su documento de perfil.
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeProfile = onSnapshot(
        userDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile({ id: snapshot.id, ...snapshot.data() } as UserProfile);
          } else {
            // Esto puede ocurrir brevemente después de un nuevo inicio de sesión,
            // antes de que se cree el documento de perfil.
            setUserProfile(null);
          }
          setLoading(false); // La carga termina cuando obtenemos una respuesta del perfil.
        },
        (error: FirestoreError) => {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
          setLoading(false);
        }
      );
      return () => unsubscribeProfile();
    } else {
        // Si no hay usuario, aseguramos que el estado de carga sea falso.
        setLoading(false);
    }
  }, [user, db]);

  return { user, userProfile, loading };
}
