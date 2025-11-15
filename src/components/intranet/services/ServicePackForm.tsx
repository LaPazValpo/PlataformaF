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
import type { ServicePack } from '@/lib/types';
import { Switch } from '@/components/ui/switch';

type FormMode = 'create' | 'edit';
type ServicePackFormInput = Omit<ServicePack, 'id' | 'createdAt' | 'updatedAt' | 'features'> & { featuresText: string };

export default function ServicePackForm({
  mode,
  servicePackId,
  initialData,
  onSuccess,
}: {
  mode: FormMode;
  servicePackId?: string;
  initialData?: Partial<ServicePack>;
  onSuccess?: () => void;
}) {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ServicePackFormInput>({
    title: initialData?.title ?? '',
    price: initialData?.price ?? '',
    priceValue: initialData?.priceValue ?? 0,
    description: initialData?.description ?? '',
    idealFor: initialData?.idealFor ?? '',
    featuresText: (initialData?.features ?? []).map(f => `${f.title}|${f.image}`).join('\n'),
    recommended: initialData?.recommended ?? false,
  });

  const handleChange = (key: keyof ServicePackFormInput, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!db || (mode === 'edit' && !servicePackId)) return;
    setLoading(true);

    const features = form.featuresText.split('\n').map(line => {
        const [title, image] = line.split('|');
        return { title: title?.trim() ?? '', image: image?.trim() ?? '', description: '' };
    }).filter(f => f.title);


    const payload = {
      title: form.title,
      price: form.price,
      priceValue: Number(form.priceValue),
      description: form.description,
      idealFor: form.idealFor,
      features: features,
      recommended: form.recommended,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (mode === 'edit') {
        const docRef = doc(db, 'servicePacks', servicePackId!);
        await updateDoc(docRef, payload);
        toast({ title: 'Pack de Servicio actualizado con éxito' });
      }
      onSuccess?.();
    } catch (e: any) {
      const permissionError = new FirestorePermissionError({
        path: `servicePacks/${servicePackId}`,
        operation: 'update',
        requestResourceData: payload,
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Error de Permiso', description: 'No tienes permisos para editar servicios.' });
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
          <Input value={form.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="$1.800.000" />
        </div>
        <div>
          <Label>Precio (valor numérico)</Label>
          <Input type="number" value={form.priceValue} onChange={(e) => handleChange('priceValue', e.target.value)} placeholder="1800000" />
        </div>
        <div className="col-span-2">
          <Label>Ideal Para</Label>
          <Input value={form.idealFor} onChange={(e) => handleChange('idealFor', e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label>Descripción</Label>
          <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label>Características (una por línea, formato: Título|ID_Imagen)</Label>
          <Textarea value={form.featuresText} onChange={(e) => handleChange('featuresText', e.target.value)} rows={8} />
          <p className="text-xs text-muted-foreground mt-1">
            Ejemplo: Urna de pino fino|4
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="recommended" checked={form.recommended} onCheckedChange={(v) => handleChange('recommended', v)} />
          <Label htmlFor="recommended">Recomendado</Label>
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
