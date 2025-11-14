'use client';
import {
  collection,
  onSnapshot,
  query,
  where,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { useFirestore } from '..';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T>(path: string, field?: string, value?: string) {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const memoizedQuery = useMemo(() => {
    if (!db) return null;
    let q: Query<DocumentData>;
    if (field && value) {
      q = query(collection(db, path), where(field, '==', value));
    } else {
      q = query(collection(db, path));
    }
    return q;
  }, [db, path, field, value]);

  useEffect(() => {
    if (!memoizedQuery) return;

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const items = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as T)
        );
        setData(items);
        setLoading(false);
      },
      (error: FirestoreError) => {
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error('Error fetching collection:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery, path]);

  return { data, loading };
}
