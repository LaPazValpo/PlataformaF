import { inventory } from '@/lib/data';
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

function getStockStatus(quantity: number): { text: string; variant: 'default' | 'secondary' | 'destructive' } {
  if (quantity <= 0) {
    return { text: 'Sin Stock', variant: 'destructive' };
  }
  if (quantity < 10) {
    return { text: 'Stock Bajo', variant: 'secondary' };
  }
  return { text: 'En Stock', variant: 'default' };
}

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Inventario"
        description="Monitorea los niveles de stock de productos y servicios."
      />
      <Card>
        <CardHeader>
          <CardTitle>Items de Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-center">Estado</TableHead>
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
