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
import type { IndividualService } from '@/lib/types';

type FormMode = 'create' | 'edit';
type FormInput = Omit<IndividualService, 'id' | 'createdAt' | 'updatedAt'>;

export default function IndividualServiceForm({
  mode,
  serviceId,
  initialData,
  onSuccess,
}: {
  mode: FormMode;
  serviceId?: string;
  initialData?: Partial<IndividualService>;
  onSuccess?: () => void;
}) {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormInput>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? '',
    priceValue: initialData?.priceValue ?? 0,
  });

  const handleChange = (key: keyof FormInput, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!db || (mode === 'edit' && !serviceId)) return;
    setLoading(true);

    const payload = {
      ...form,
      priceValue: Number(form.priceValue),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (mode === 'edit') {
        const docRef = doc(db, 'individualServices', serviceId!);
        await updateDoc(docRef, payload);
        toast({ title: 'Servicio actualizado con éxito' });
      }
      onSuccess?.();
    } catch (e: any) {
      const permissionError = new FirestorePermissionError({ path: `individualServices/${serviceId}`, operation: 'update', requestResourceData: payload });
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Error de Permiso', description: 'No tienes permisos para editar este servicio.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Título</Label>
          <Input value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
        </div>
        <div>
          <Label>Precio (texto)</Label>
          <Input value={form.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="Consultar" />
        </div>
        <div>
          <Label>Precio (valor numérico)</Label>
          <Input type="number" value={form.priceValue} onChange={(e) => handleChange('priceValue', e.target.value)} placeholder="0" />
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
