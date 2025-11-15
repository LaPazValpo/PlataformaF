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
import type { ServicePack, ServicePackFeature } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type FormMode = 'create' | 'edit';
type ServicePackFormInput = Omit<ServicePack, 'id' | 'createdAt' | 'updatedAt'>;

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
    features: initialData?.features ?? [],
    recommended: initialData?.recommended ?? false,
  });

  const handleChange = (key: keyof ServicePackFormInput, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleFeatureChange = (index: number, field: keyof ServicePackFeature, value: any) => {
      const newFeatures = [...form.features];
      newFeatures[index] = { ...newFeatures[index], [field]: value };
      handleChange('features', newFeatures);
  }

  const handleAddFeature = () => {
      handleChange('features', [...form.features, { title: '', description: '', image: '', hideImage: false }]);
  }

  const handleRemoveFeature = (index: number) => {
      const newFeatures = form.features.filter((_, i) => i !== index);
      handleChange('features', newFeatures);
  }

  const handleSubmit = async () => {
    if (!db || (mode === 'edit' && !servicePackId)) return;
    setLoading(true);

    const payload = {
      ...form,
      priceValue: Number(form.priceValue),
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
        
        <div className="col-span-2 space-y-4">
            <div className='flex justify-between items-center'>
                <Label>Características del Carrusel</Label>
                <Button variant="outline" size="sm" onClick={handleAddFeature}>
                    <Plus className="mr-2 h-4 w-4" /> Añadir
                </Button>
            </div>
            <Card className="p-4 max-h-64 overflow-y-auto">
                <CardContent className="p-0 space-y-4">
                    {form.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input 
                                placeholder="Descripción de la característica" 
                                value={feature.title}
                                onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                                className="flex-grow"
                            />
                             <Select value={feature.image} onValueChange={(value) => handleFeatureChange(index, 'image', value)}>
                                <SelectTrigger className="w-[280px]">
                                    <SelectValue placeholder="Seleccionar imagen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {PlaceHolderImages.map((img) => (
                                        <SelectItem key={img.id} value={img.id}>
                                            {img.description} (ID: {img.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <div className="flex items-center gap-1">
                                <Switch
                                    id={`hideImage-${index}`}
                                    checked={!feature.hideImage}
                                    onCheckedChange={(checked) => handleFeatureChange(index, 'hideImage', !checked)}
                                />
                                <Label htmlFor={`hideImage-${index}`} className="text-xs">Mostrar</Label>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFeature(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                     {form.features.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No hay características. Haz clic en "Añadir" para empezar.
                        </p>
                    )}
                </CardContent>
            </Card>
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
