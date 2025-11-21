'use client';
import { useState } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Plus, Copy, Trash2, Pencil } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';

function GalleryImageForm({ image, onSave }: { image?: ImagePlaceholder; onSave: (data: ImagePlaceholder) => void }) {
    const [id, setId] = useState(image?.id || '');
    const [description, setDescription] = useState(image?.description || '');
    const [imageUrl, setImageUrl] = useState(image?.imageUrl || '');
    const [imageHint, setImageHint] = useState(image?.imageHint || '');

    const handleSave = () => {
        onSave({ id, description, imageUrl, imageHint });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="img-id">ID Único</Label>
                <Input id="img-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="Ej: 1, 2, 'urna-pino'" disabled={!!image} />
                {image && <p className="text-xs text-muted-foreground mt-1">El ID no se puede cambiar al editar.</p>}
            </div>
            <div>
                <Label htmlFor="img-url">URL de la Imagen</Label>
                <Input id="img-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
            </div>
            <div>
                <Label htmlFor="img-desc">Descripción (para el menú)</Label>
                <Input id="img-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Urna de pino con acabado barnizado" />
            </div>
            <div>
                <Label htmlFor="img-hint">Pista para IA (1-2 palabras)</Label>
                <Input id="img-hint" value={imageHint} onChange={(e) => setImageHint(e.target.value)} placeholder="wood urn" />
            </div>
            <Button onClick={handleSave} className="w-full">Guardar Imagen</Button>
        </div>
    );
}

export default function GalleryPage() {
    const { toast } = useToast();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImagePlaceholder | undefined>(undefined);

    const handleAction = (action: 'create' | 'edit' | 'delete', data?: ImagePlaceholder) => {
        // Log the data to the console so the user can give it to the assistant
        console.log(`Acción: ${action}`, data);
        toast({
            title: `Datos para la acción '${action}' registrados`,
            description: "Por favor, copia el objeto de la consola y pídele al asistente que aplique el cambio.",
            duration: 8000,
        });
        if (isCreateOpen) setIsCreateOpen(false);
        if (isEditOpen) setIsEditOpen(false);
    };
    
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "ID Copiado", description: `El ID "${text}" ha sido copiado al portapapeles.` });
    }
    
    const openEditDialog = (image: ImagePlaceholder) => {
        setSelectedImage(image);
        setIsEditOpen(true);
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <PageHeader
                    title="Galería de Imágenes de Servicios"
                    description="Gestiona las imágenes utilizadas en los carruseles de las propuestas."
                />
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Añadir Nueva Imagen
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Añadir Nueva Imagen a la Galería</DialogTitle>
                            <DialogDescription>
                                Registra una nueva imagen para que esté disponible en los menús de selección de servicios.
                            </DialogDescription>
                        </DialogHeader>
                        <GalleryImageForm onSave={(data) => handleAction('create', data)} />
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {PlaceHolderImages.map((image) => (
                    <Card key={image.id} className="overflow-hidden group">
                        <CardContent className="p-0 aspect-video relative">
                            <Image
                                src={image.imageUrl}
                                alt={image.description}
                                width={600}
                                height={400}
                                className="w-full h-full object-cover"
                                data-ai-hint={image.imageHint}
                            />
                        </CardContent>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base truncate">{image.description}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                ID: {image.id}
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyToClipboard(image.id)}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 border-t flex gap-2">
                             <Button variant="outline" size="sm" className="w-full" onClick={() => openEditDialog(image)}>
                                <Pencil className="mr-2 h-3 w-3" /> Editar
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="w-full">
                                        <Trash2 className="mr-2 h-3 w-3" /> Eliminar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás seguro de que quieres eliminar esta imagen?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción registrará los datos en la consola para que el asistente pueda eliminar la imagen de la galería. No se puede deshacer.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleAction('delete', image)}>Sí, eliminar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Imagen de la Galería</DialogTitle>
                    </DialogHeader>
                    {selectedImage && <GalleryImageForm image={selectedImage} onSave={(data) => handleAction('edit', data)} />}
                </DialogContent>
            </Dialog>

        </div>
    );
}
