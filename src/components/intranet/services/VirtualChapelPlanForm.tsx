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
import type { VirtualChapelPlan } from '@/lib/types';

type FormMode = 'create' | 'edit';
type FormInput = Omit<VirtualChapelPlan, 'id' | 'createdAt' | 'updatedAt' | 'features'> & { featuresCsv: string };

export default function VirtualChapelPlanForm({
  mode,
  planId,
  initialData,
  onSuccess,
}: {
  mode: FormMode;
  planId?: string;
  initialData?: Partial<VirtualChapelPlan>;
  onSuccess?: () => void;
}) {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormInput>({
    title: initialData?.title ?? '',
    price: initialData?.price ?? '',
    priceValue: initialData?.priceValue ?? 0,
    description: initialData?.description ?? '',
    featuresCsv: (initialData?.features ?? []).join(', '),
  });

  const handleChange = (key: keyof FormInput, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!db || (mode === 'edit' && !planId)) return;
    setLoading(true);

    const payload = {
      ...form,
      priceValue: Number(form.priceValue),
      features: form.featuresCsv.split(',').map(s => s.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    // Omit featuresCsv from the final payload
    const { featuresCsv, ...finalPayload } = payload;

    try {
      if (mode === 'edit') {
        const docRef = doc(db, 'virtualChapelPlans', planId!);
        await updateDoc(docRef, finalPayload);
        toast({ title: 'Plan de Capilla Virtual actualizado con éxito' });
      }
      onSuccess?.();
    } catch (e: any) {
      const permissionError = new FirestorePermissionError({ path: `virtualChapelPlans/${planId}`, operation: 'update', requestResourceData: finalPayload });
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Error de Permiso', description: 'No tienes permisos para editar este plan.' });
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
          <Input value={form.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="$50.000" />
        </div>
        <div>
          <Label>Precio (valor numérico)</Label>
          <Input type="number" value={form.priceValue} onChange={(e) => handleChange('priceValue', e.target.value)} placeholder="50000" />
        </div>
        <div className="col-span-2">
          <Label>Descripción</Label>
          <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label>Características (separadas por coma)</Label>
          <Textarea value={form.featuresCsv} onChange={(e) => handleChange('featuresCsv', e.target.value)} />
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
