'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sales, prospects, sellers, proposals, inventory, servicePacks, virtualChapelPlans, individualServices, virtualTombs, testimonials } from '@/lib/data';
import { Database } from 'lucide-react';

export function SeedDatabaseButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();

  const handleSeed = async () => {
    if (!db) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'La base de datos no está lista.',
        });
        return;
    }
    setLoading(true);
    toast({
      title: 'Poblando la base de datos...',
      description: 'Este proceso puede tardar unos segundos.',
    });

    try {
      const batch = writeBatch(db);

      const collectionsToSeed = [
        { data: sales, name: 'sales' },
        { data: prospects, name: 'prospects' },
        { data: sellers, name: 'sellers' },
        { data: proposals, name: 'proposals' },
        { data: inventory, name: 'inventory' },
        { data: servicePacks, name: 'servicePacks' },
        { data: virtualChapelPlans, name: 'virtualChapelPlans' },
        { data: individualServices, name: 'individualServices' },
        { data: virtualTombs, name: 'virtualTombs' },
        { data: testimonials, name: 'testimonials' },
      ];

      collectionsToSeed.forEach(coll => {
        const collRef = collection(db, coll.name);
        coll.data.forEach(item => {
          const docRef = doc(collRef, item.id);
          batch.set(docRef, item);
        });
      });

      await batch.commit();

      toast({
        title: '¡Éxito!',
        description: 'La base de datos ha sido poblada con datos de ejemplo.',
      });
      
      // Reload the page to reflect changes
      window.location.reload();

    } catch (error) {
      console.error("Error seeding database: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo poblar la base de datos.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSeed} disabled={loading}>
        <Database className="mr-2 h-4 w-4" />
        {loading ? 'Poblando...' : 'Poblar Base de Datos con Datos de Ejemplo'}
    </Button>
  );
}
