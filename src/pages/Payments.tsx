import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Receipt,
  RefreshCw
} from 'lucide-react';
import { PaymentCollectionDialog } from '@/components/payments/PaymentCollectionDialog';

// Payment status types
type PaymentStatus = 'pending' | 'paid' | 'expired' | 'cancelled';

// Mock payment data
interface PaymentTransaction {
  id: string;
  customerPhone: string;
  customerName: string;
  amount: number;
  fee: number;
  netAmount: number;
  provider: 'tabby' | 'tamara' | 'mispay';
  feeHandling: 'customer_pays' | 'merchant_pays';
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
}

const mockPayments: PaymentTransaction[] = [
  {
    id: 'PAY-001',
    customerPhone: '0501234567',
    customerName: 'أحمد محمد',
    amount: 1500,
    fee: 90,
    netAmount: 1500,
    provider: 'tabby',
    feeHandling: 'customer_pays',
    status: 'paid',
    createdAt: '2024-01-10T10:30:00',
    paidAt: '2024-01-10T11:15:00'
  },
  {
    id: 'PAY-002',
    customerPhone: '0559876543',
    customerName: 'سعد العتيبي',
    amount: 2300,
    fee: 115,
    netAmount: 2185,
    provider: 'tamara',
    feeHandling: 'merchant_pays',
    status: 'pending',
    createdAt: '2024-01-11T14:20:00'
  },
  {
    id: 'PAY-003',
    customerPhone: '0541112233',
    customerName: 'خالد الشمري',
    amount: 850,
    fee: 34,
    netAmount: 850,
    provider: 'mispay',
    feeHandling: 'customer_pays',
    status: 'expired',
    createdAt: '2024-01-08T09:00:00'
  },
  {
    id: 'PAY-004',
    customerPhone: '0533445566',
    customerName: 'فهد القحطاني',
    amount: 3200,
    fee: 192,
    netAmount: 3200,
    provider: 'tabby',
    feeHandling: 'customer_pays',
    status: 'pending',
    createdAt: '2024-01-12T16:45:00'
  },
];

const providerConfig = {
  tabby: { name: 'تابي', logo: '💳', color: 'bg-emerald-100 text-emerald-700' },
  tamara: { name: 'تمارا', logo: '🛒', color: 'bg-pink-100 text-pink-700' },
  mispay: { name: 'مس باي', logo: '💰', color: 'bg-blue-100 text-blue-700' }
};

const statusConfig: Record<PaymentStatus, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'في الانتظار', icon: <Clock className="h-3 w-3" />, variant: 'secondary' },
  paid: { label: 'مدفوع', icon: <CheckCircle2 className="h-3 w-3" />, variant: 'default' },
  expired: { label: 'منتهي', icon: <AlertCircle className="h-3 w-3" />, variant: 'outline' },
  cancelled: { label: 'ملغي', icon: <XCircle className="h-3 w-3" />, variant: 'destructive' }
};

const Payments: React.FC = () => {
  const [payments] = useState<PaymentTransaction[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.customerPhone.includes(searchQuery) ||
      payment.customerName.includes(searchQuery) ||
      payment.id.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesProvider = providerFilter === 'all' || payment.provider === providerFilter;
    return matchesSearch && matchesStatus && matchesProvider;
  });

  // Calculate stats
  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    paid: payments.filter(p => p.status === 'paid').length,
    totalAmount: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.netAmount, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-7 w-7 text-primary" />
              إدارة التحصيل
            </h1>
            <p className="text-muted-foreground">
              أرسل روابط دفع لعملائك وتتبع حالة المدفوعات
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            طلب دفعة جديدة
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">في الانتظار</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المحصّل</p>
                  <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString()} <span className="text-sm font-normal">ر.س</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">قيد التحصيل</p>
                  <p className="text-2xl font-bold">{stats.pendingAmount.toLocaleString()} <span className="text-sm font-normal">ر.س</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث برقم الجوال أو اسم العميل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <CreditCard className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="البوابة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع البوابات</SelectItem>
                  <SelectItem value="tabby">تابي</SelectItem>
                  <SelectItem value="tamara">تمارا</SelectItem>
                  <SelectItem value="mispay">مس باي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>سجل العمليات</span>
              <Badge variant="secondary">{filteredPayments.length} عملية</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم العملية</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">الرسوم</TableHead>
                    <TableHead className="text-right">الصافي</TableHead>
                    <TableHead className="text-right">البوابة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        لا توجد عمليات مطابقة
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.customerName}</div>
                            <div className="text-sm text-muted-foreground" dir="ltr">{payment.customerPhone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{payment.amount.toLocaleString()} ر.س</TableCell>
                        <TableCell className={`font-mono text-sm ${payment.feeHandling === 'merchant_pays' ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {payment.feeHandling === 'merchant_pays' ? '-' : ''}{payment.fee} ر.س
                        </TableCell>
                        <TableCell className="font-mono font-medium text-green-600">
                          {payment.netAmount.toLocaleString()} ر.س
                        </TableCell>
                        <TableCell>
                          <Badge className={providerConfig[payment.provider].color}>
                            {providerConfig[payment.provider].logo} {providerConfig[payment.provider].name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[payment.status].variant} className="gap-1">
                            {statusConfig[payment.status].icon}
                            {statusConfig[payment.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                        <TableCell>
                          {payment.status === 'pending' && (
                            <Button variant="ghost" size="sm" className="gap-1">
                              <RefreshCw className="h-3 w-3" />
                              إعادة إرسال
                            </Button>
                          )}
                          {payment.status === 'expired' && (
                            <Button variant="ghost" size="sm" className="gap-1">
                              <RefreshCw className="h-3 w-3" />
                              تجديد
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Collection Dialog */}
        <PaymentCollectionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </Layout>
  );
};

export default Payments;
