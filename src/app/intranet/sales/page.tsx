'use client';

import * as React from 'react';
import {
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type { Sale, Seller } from '@/lib/types';
import { useCollection } from '@/firebase';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

export const columns: ColumnDef<SellerPerformance>[] = [
  {
    accessorKey: 'name',
    header: 'Vendedor',
    cell: ({ row }) => {
      const seller = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`https://picsum.photos/seed/${seller.id}/40/40`} />
            <AvatarFallback>{seller.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{seller.name}</span>
            <span className="text-sm text-muted-foreground">{seller.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'sales',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right w-full"
      >
        Ventas (Unidades)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue('sales')}</div>,
  },
  {
    accessorKey: 'totalSalesValue',
    header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-right w-full"
        >
          Ventas (Valor)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue('totalSalesValue'))}</div>,
  },
  {
    accessorKey: 'conversionRate',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right w-full"
      >
        Tasa de Conversión
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue('conversionRate')}%</div>,
  },
  {
    accessorKey: 'commissionEarned',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right w-full"
      >
        Comisión Ganada
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue('commissionEarned'))}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => (
      <div className="capitalize">
        <Badge variant={row.getValue('status') === 'Activo' ? 'default' : 'secondary'}>
          {row.getValue('status') as string}
        </Badge>
      </div>
    ),
  },
];

function SalesPerformanceSkeleton() {
    return (
        <div className="w-full">
            <PageHeader
                title="Gestión de Vendedores"
                description="Supervisa el equipo de ventas, su rendimiento y comisiones."
            />
            <div className="flex items-center py-4">
                <Skeleton className="h-10 w-full max-w-sm" />
                <Skeleton className="h-10 w-24 ml-auto" />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[...Array(6)].map((_, i) => (
                                <TableHead key={i}>
                                    <Skeleton className="h-5 w-full" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                {[...Array(6)].map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-5 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default function SalesPerformancePage() {
  const { data: sales, loading: loadingSales } = useCollection<Sale>('sales');
  const { data: sellers, loading: loadingSellers } = useCollection<Seller>('sellers');
  
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const sellerPerformanceData = React.useMemo(() => {
    if (loadingSellers || loadingSales || !sellers || !sales) return [];
    
    return sellers.map(seller => {
      const sellerSales = sales.filter(sale => sale.seller === seller.name);
      const totalSalesValue = sellerSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
      const commissionEarned = totalSalesValue * (seller.commission / 100);

      return {
        ...seller,
        sales: sellerSales.length, // Update sales count from actual sales
        totalSalesValue,
        commissionEarned,
      };
    });

  }, [sellers, sales, loadingSellers, loadingSales]);

  const table = useReactTable({
    data: sellerPerformanceData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loadingSales || loadingSellers) {
    return <SalesPerformanceSkeleton />;
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
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={event => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columnas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={value => column.toggleVisibility(!!value)}
                >
                  {column.id === 'name' ? 'Vendedor' :
                   column.id === 'sales' ? 'Ventas (Unidades)' :
                   column.id === 'totalSalesValue' ? 'Ventas (Valor)' :
                   column.id === 'conversionRate' ? 'Tasa de Conversión' :
                   column.id === 'commissionEarned' ? 'Comisión Ganada' :
                   column.id === 'status' ? 'Estado' : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
