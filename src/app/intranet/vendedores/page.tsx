'use client';

import * as React from 'react';
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Plus,
  BarChart,
  Target,
  DollarSign,
  TrendingUp,
  CircleUser,
  Trash2,
} from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';

import type { Sale, Seller } from '@/lib/types';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SellerForm from '@/components/intranet/vendedores/SellerForm';
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
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


type SellerPerformance = Seller & {
  totalSalesValue: number;
  commissionEarned: number;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
};


function SellerProfileModal({ seller, children }: { seller: SellerPerformance, children: React.ReactNode }) {
    const db = useFirestore();
    const { toast } = useToast();
    const { userProfile } = useUser();
    const isAdmin = userProfile?.role === 'Administrador';
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);


    const stats = [
        { icon: BarChart, label: "Ventas (Unidades)", value: seller.sales },
        { icon: DollarSign, label: "Ventas (Valor)", value: formatCurrency(seller.totalSalesValue) },
        { icon: Target, label: "Tasa de Conversión", value: `${seller.conversionRate}%` },
        { icon: TrendingUp, label: "Comisión Ganada", value: formatCurrency(seller.commissionEarned) },
    ]

    const handleDeleteSeller = async () => {
        if (!db || !isAdmin) return;
        const sellerRef = doc(db, 'sellers', seller.id);
        try {
            await deleteDoc(sellerRef);
            toast({ title: 'Vendedor eliminado con éxito' });
            setIsProfileOpen(false); // Cierra el modal principal
        } catch (e) {
             const permissionError = new FirestorePermissionError({ path: sellerRef.path, operation: 'delete' });
             errorEmitter.emit('permission-error', permissionError);
             toast({ variant: 'destructive', title: 'Error al eliminar', description: 'No tienes permisos para realizar esta acción.' });
        }
    };

    return (
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={`https://picsum.photos/seed/${seller.id}/100/100`} />
                            <AvatarFallback>{seller.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-2xl">{seller.name}</DialogTitle>
                            <DialogDescription>{seller.email}</DialogDescription>
                             <Badge variant={seller.status === 'Activo' ? 'default' : 'secondary'} className="mt-2">{seller.status}</Badge>
                        </div>
                    </div>
                </DialogHeader>
                <div className="py-4 grid grid-cols-2 gap-4">
                    {stats.map(stat => (
                        <div key={stat.label} className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <stat.icon className="h-4 w-4" />
                                {stat.label}
                            </div>
                            <div className="text-xl font-bold">{stat.value}</div>
                        </div>
                    ))}
                </div>
                {isAdmin && (
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex-1">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar Vendedor
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Editar Vendedor</DialogTitle>
                                </DialogHeader>
                                <SellerForm 
                                  mode="edit" 
                                  sellerId={seller.id} 
                                  initialData={seller}
                                  onSuccess={() => setIsFormOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="flex-1">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro de eliminar a {seller.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Se eliminará permanentemente el registro del vendedor.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteSeller}>Sí, eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

function SellerCard({ seller }: { seller: SellerPerformance }) {
  return (
    <SellerProfileModal seller={seller}>
        <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarImage src={`https://picsum.photos/seed/${seller.id}/100/100`} />
              <AvatarFallback>{seller.initials}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">{seller.name}</h3>
            <p className="text-sm text-muted-foreground">{seller.email}</p>
            <Badge variant="outline" className="mt-4">{seller.role}</Badge>
          </CardContent>
        </Card>
    </SellerProfileModal>
  );
}


function VendedoresPageSkeleton() {
    return (
        <div className="w-full">
            <PageHeader
                title="Gestión de Vendedores"
                description="Supervisa el equipo de ventas, su rendimiento y comisiones."
            />
            <div className="flex items-center py-4">
                <Skeleton className="h-10 w-full max-w-sm" />
                <Skeleton className="h-10 w-36 ml-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="flex flex-col items-center p-6 text-center">
                            <Skeleton className="w-20 h-20 rounded-full mb-4" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-4" />
                            <Skeleton className="h-6 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function VendedoresPage() {
  const { userProfile } = useUser();
  const { data: sales, loading: loadingSales } = useCollection<Sale>('sales');
  const { data: sellers, loading: loadingSellers } = useCollection<Seller>('sellers');
  
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const isAdmin = userProfile?.role === 'Administrador';

  const sellerPerformanceData = React.useMemo(() => {
    if (loadingSellers || loadingSales || !sellers || !sales) return [];
    
    return sellers.map(seller => {
      const sellerSales = sales.filter(sale => sale.seller === seller.name);
      const totalSalesValue = sellerSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
      const commissionEarned = totalSalesValue * (seller.commission / 100);

      return {
        ...seller,
        sales: sellerSales.length,
        totalSalesValue,
        commissionEarned,
      };
    });

  }, [sellers, sales, loadingSellers, loadingSales]);

  const filteredSellers = React.useMemo(() => {
    if (!searchTerm) return sellerPerformanceData;
    return sellerPerformanceData.filter(seller => 
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sellerPerformanceData, searchTerm]);


  if (loadingSales || loadingSellers) {
    return <VendedoresPageSkeleton />;
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Gestión de Vendedores"
        description="Supervisa el equipo de ventas, su rendimiento y comisiones."
      />
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por vendedor..."
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-2">
            {isAdmin && (
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2"/>
                            Crear Vendedor
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nuevo Vendedor</DialogTitle>
                        </DialogHeader>
                        <SellerForm mode="create" onSuccess={() => setIsCreateOpen(false)} />
                    </DialogContent>
                </Dialog>
            )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredSellers.map(seller => (
            <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>
      {filteredSellers.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground mt-10">
              No se encontraron vendedores.
          </div>
      )}
    </div>
  );
}
