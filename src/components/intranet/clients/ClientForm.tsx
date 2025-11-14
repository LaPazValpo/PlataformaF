'use client';

import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Client } from '@/lib/types';

type FormMode = 'create' | 'edit';

type ClientFormInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'date'>;

export default function ClientForm({
  mode,
  clientId,
  initialData,
  onSuccess,
}: {
  mode: FormMode;
  clientId?: string;
  initialData?: Partial<Client>;
  onSuccess?: () => void;
}) {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ClientFormInput>({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    seller: initialData?.seller ?? '',
  });

  const handleChange = (key: keyof ClientFormInput, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!db || (mode === 'edit' && !clientId)) return;
    setLoading(true);

    const payload = {
        ...form,
        updatedAt: new Date().toISOString(),
    };

    try {
        if (mode === 'edit') {
            const docRef = doc(db, 'clients', clientId!);
            await updateDoc(docRef, payload);
            toast({ title: 'Cliente actualizado con éxito' });
        }
        // Create mode can be added here if needed
      onSuccess?.();
    } catch (e: any) {
      console.error('Error submitting form: ', e);
       const permissionError = new FirestorePermissionError({
          path: `clients/${clientId}`,
          operation: 'update',
          requestResourceData: payload,
        });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Error de Permiso',
        description: 'No tienes permisos para editar este cliente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre</Label>
          <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        </div>
        <div>
          <Label>Vendedor Asignado</Label>
          <Input value={form.seller} onChange={(e) => handleChange('seller', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
