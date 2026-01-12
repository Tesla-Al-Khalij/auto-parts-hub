import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Eye,
  ShoppingCart,
  Filter
} from 'lucide-react';
import { mockOrders } from '@/data/mockData';
import { Order, OrderStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    let results = orders;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(o => 
        o.orderNumber.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'all') {
      results = results.filter(o => o.status === statusFilter);
    }
    
    return results;
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    toast({
      title: 'تم التحديث',
      description: 'تم تحديث حالة الطلب بنجاح',
    });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            إدارة الطلبات
          </h1>
          <p className="text-muted-foreground mt-1">
            إجمالي {orders.length} طلب
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث برقم الطلب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">عدد القطع</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        {order.orderNumber}
                        {order.isDraft && (
                          <Badge variant="outline" className="mr-2">مسودة</Badge>
                        )}
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.items.length} قطعة</TableCell>
                      <TableCell className="font-medium">
                        {order.total.toLocaleString('ar-SA')} ر.س
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={order.status} 
                          onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger className={`w-[140px] ${statusColors[order.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>تفاصيل الطلب {selectedOrder?.orderNumber}</DialogTitle>
              <DialogDescription>
                تاريخ الطلب: {selectedOrder?.date}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">القطعة</TableHead>
                        <TableHead className="text-right">الكمية</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-right">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.partNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unitPrice.toFixed(2)} ر.س</TableCell>
                          <TableCell className="font-medium">{item.total.toFixed(2)} ر.س</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span>{selectedOrder.subtotal.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
                    <span>{selectedOrder.vat.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>الإجمالي</span>
                    <span>{selectedOrder.total.toFixed(2)} ر.س</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>ملاحظات:</strong> {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
