'use client';
import {
  doc,
  onSnapshot,
  DocumentReference,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { useFirestore } from '..';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T>(path: string, id?: string) {
  const db = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const memoizedDocRef = useMemo(() => {
    if (!db || !id) return null;
    return doc(db, path, id) as DocumentReference<DocumentData>;
  }, [db, path, id]);

  useEffect(() => {
    if (!memoizedDocRef) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (error: FirestoreError) => {
        const permissionError = new FirestorePermissionError({
          path: memoizedDocRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error('Error fetching document:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, loading };
}
