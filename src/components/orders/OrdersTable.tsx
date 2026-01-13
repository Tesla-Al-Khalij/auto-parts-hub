import { Link } from 'react-router-dom';
import { Eye, FileEdit, Send, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { OrderStatusBadge } from './OrderStatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type SortField = 'date' | 'orderNumber' | 'total' | 'itemsCount';
type SortDirection = 'asc' | 'desc';

interface OrdersTableProps {
  orders: Order[];
  startIndex?: number;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
  onEditDraft?: (order: Order) => void;
}

export function OrdersTable({ orders, startIndex = 0, sortField, sortDirection, onSort, onEditDraft }: OrdersTableProps) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 mr-1 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 mr-1" /> 
      : <ArrowDown className="h-4 w-4 mr-1" />;
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button 
      onClick={() => onSort?.(field)}
      className="flex items-center gap-1 hover:text-primary transition-colors font-bold"
    >
      {children}
      <SortIcon field={field} />
    </button>
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-right font-bold w-12">#</TableHead>
            <TableHead className="text-right">
              <SortableHeader field="orderNumber">رقم الطلب</SortableHeader>
            </TableHead>
            <TableHead className="text-right font-bold">المورد</TableHead>
            <TableHead className="text-right">
              <SortableHeader field="date">التاريخ</SortableHeader>
            </TableHead>
            <TableHead className="text-right">
              <SortableHeader field="itemsCount">عدد القطع</SortableHeader>
            </TableHead>
            <TableHead className="text-right">
              <SortableHeader field="total">الإجمالي</SortableHeader>
            </TableHead>
            <TableHead className="text-right font-bold">الحالة</TableHead>
            <TableHead className="text-center font-bold">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => {
            const formattedDate = new Date(order.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <TableRow key={order.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-muted-foreground">
                  {startIndex + index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{order.orderNumber}</span>
                    {order.isDraft && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                        مسودة
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-foreground">تسلا الخليج</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{formattedDate}</TableCell>
                <TableCell>
                  <span className="font-medium">{order.items.length}</span>
                  <span className="text-muted-foreground text-sm mr-1">قطع</span>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-primary">
                    {order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-muted-foreground text-sm mr-1">ر.س</span>
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    {order.isDraft ? (
                      <>
                        <Button size="sm" className="h-9 gap-1">
                          <Send className="h-4 w-4" />
                          إرسال
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 gap-1"
                          onClick={() => onEditDraft?.(order)}
                        >
                          <FileEdit className="h-4 w-4" />
                          تعديل
                        </Button>
                      </>
                    ) : (
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="h-9 gap-1">
                          <Eye className="h-4 w-4" />
                          عرض
                        </Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
