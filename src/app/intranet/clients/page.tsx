'use client';

import * as React from 'react';
import {
  Trash2,
  Pencil,
  MoreHorizontal
} from 'lucide-react';

import type { Client } from '@/lib/types';
import { useCollection, useFirestore } from '@/firebase';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ClientForm from '@/components/intranet/clients/ClientForm';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
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


function ClientActions({ client }: { client: Client }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const handleDeleteClient = async () => {
    if (!db) return;
    const clientRef = doc(db, 'clients', client.id);
    try {
      await deleteDoc(clientRef);
      toast({ title: 'Cliente eliminado' });
    } catch (e) {
      const permissionError = new FirestorePermissionError({ path: clientRef.path, operation: 'delete' });
      errorEmitter.emit('permission-error', permissionError);
      toast({ variant: 'destructive', title: 'Error al eliminar', description: 'No tienes permisos.' });
    }
  };

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DialogTrigger asChild>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            </DialogTrigger>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                  Eliminar
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro de eliminar este cliente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción es irreversible y eliminará el cliente de tu base de datos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteClient}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm
            mode="edit"
            clientId={client.id}
            initialData={client}
            onSuccess={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function ClientsPageSkeleton() {
    return (
        <div className="w-full">
            <PageHeader
                title="Base de Datos de Clientes"
                description="Gestiona todos los contactos para tus campañas de marketing."
            />
            <div className="flex items-center py-4">
                <Skeleton className="h-10 w-full max-w-sm" />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[...Array(5)].map((_, i) => (
                                <TableHead key={i}> <Skeleton className="h-5 w-full" /> </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                {[...Array(5)].map((_, j) => (
                                    <TableCell key={j}> <Skeleton className="h-5 w-full" /> </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default function ClientsPage() {
  const { data: clients, loading } = useCollection<Client>('clients');
  const [filter, setFilter] = React.useState('');

  const filteredClients = React.useMemo(() => {
    return clients.filter(client => client.name.toLowerCase().includes(filter.toLowerCase()));
  }, [clients, filter]);
  
  if (loading) {
    return <ClientsPageSkeleton />;
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Base de Datos de Clientes"
        description="Gestiona todos los contactos para tus campañas de marketing."
      />
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por nombre..."
          value={filter}
          onChange={event => setFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Vendedor Asignado</TableHead>
                <TableHead>Fecha de Ingreso</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.seller}</TableCell>
                  <TableCell>{new Date(client.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <ClientActions client={client} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
