'use client';

import * as React from 'react';
import type { InventoryItem } from '@/lib/types';
import { useCollection, useUser } from '@/firebase';
import { PageHeader } from '@/components/common/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import InventoryForm from '@/components/intranet/inventory/InventoryForm';

function getStockStatus(quantity: number): { text: string; variant: 'default' | 'secondary' | 'destructive' } {
  if (quantity <= 0) {
    return { text: 'Sin Stock', variant: 'destructive' };
  }
  if (quantity < 10) {
    return { text: 'Stock Bajo', variant: 'secondary' };
  }
  return { text: 'En Stock', variant: 'default' };
}

function InventoryActions({ item }: { item: InventoryItem }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  return (
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
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Item de Inventario</DialogTitle>
        </DialogHeader>
        <InventoryForm
          mode="edit"
          itemId={item.id}
          initialData={item}
          onSuccess={() => setIsEditDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function InventorySkeleton() {
    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Inventario"
                description="Monitorea los niveles de stock de productos y servicios."
            />
            <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Items de Inventario</CardTitle>
                    <Skeleton className="h-10 w-32" />
                  </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(4)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-48 mt-1" />
                                    </TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                                    <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default function InventoryPage() {
  const { data: inventory, loading } = useCollection<InventoryItem>('inventory');
  const { userProfile } = useUser();
  const isAdmin = userProfile?.role === 'Administrador';
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  if (loading) {
    return <InventorySkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Inventario"
        description="Monitorea los niveles de stock de productos y servicios."
      />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Items de Inventario</CardTitle>
            {isAdmin && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                      <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Crear Item
                      </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>Nuevo Item de Inventario</DialogTitle>
                      </DialogHeader>
                      <InventoryForm mode="create" onSuccess={() => setIsCreateOpen(false)} />
                  </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                 {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map(item => {
                const status = getStockStatus(item.quantity);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant}>{status.text}</Badge>
                    </TableCell>
                    {isAdmin && (
                        <TableCell className="text-right">
                          <InventoryActions item={item} />
                        </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
