'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sales, prospects, sellers } from '@/lib/data';
import { Database } from 'lucide-react';

export function SeedDatabaseButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();

  const handleSeed = async () => {
    setLoading(true);
    toast({
      title: 'Poblando la base de datos...',
      description: 'Este proceso puede tardar unos segundos.',
    });

    try {
      const batch = writeBatch(db);

      // Seed Sales
      const salesCol = collection(db, 'sales');
      sales.forEach(sale => {
        const docRef = doc(salesCol, sale.id);
        batch.set(docRef, sale);
      });

      // Seed Prospects
      const prospectsCol = collection(db, 'prospects');
      prospects.forEach(prospect => {
        const docRef = doc(prospectsCol, prospect.id);
        batch.set(docRef, prospect);
      });
      
      // Seed Sellers
      const sellersCol = collection(db, 'sellers');
      sellers.forEach(seller => {
        const docRef = doc(sellersCol, seller.id);
        batch.set(docRef, seller);
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
