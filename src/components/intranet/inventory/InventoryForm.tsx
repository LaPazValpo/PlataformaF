'use client';

import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { InventoryItem } from '@/lib/types';

type FormMode = 'create' | 'edit';
type InventoryFormInput = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>;

export default function InventoryForm({
  mode,
  itemId,
  initialData,
  onSuccess,
}: {
  mode: FormMode;
  itemId?: string;
  initialData?: Partial<InventoryItem>;
  onSuccess?: () => void;
}) {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<InventoryFormInput>({
    name: initialData?.name ?? '',
    category: initialData?.category ?? '',
    quantity: initialData?.quantity ?? 0,
    description: initialData?.description ?? '',
  });

  const handleChange = (key: keyof InventoryFormInput, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!db || (mode === 'edit' && !itemId)) return;
    setLoading(true);

    const payload = {
        ...form,
        quantity: Number(form.quantity),
        updatedAt: new Date().toISOString(),
    };

    try {
      if (mode === 'edit') {
        const docRef = doc(db, 'inventory', itemId!);
        await updateDoc(docRef, payload);
        toast({ title: 'Item actualizado con éxito' });
      }
      onSuccess?.();
    } catch (e: any) {
      console.error('Error submitting form: ', e);
      const permissionError = new FirestorePermissionError({
          path: `inventory/${itemId}`,
          operation: 'update',
          requestResourceData: payload,
        });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Error de Permiso',
        description: 'No tienes permisos para editar el inventario.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Nombre del Producto</Label>
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
        <div>
          <Label>Categoría</Label>
          <Input value={form.category} onChange={(e) => handleChange('category', e.target.value)} />
        </div>
        <div>
          <Label>Cantidad</Label>
          <Input type="number" value={form.quantity} onChange={(e) => handleChange('quantity', e.target.value)} />
        </div>
        <div className="col-span-2">
            <Label>Descripción</Label>
            <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
