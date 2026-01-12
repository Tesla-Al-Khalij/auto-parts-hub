import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Pencil, 
  Warehouse,
  PackagePlus,
  PackageMinus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package
} from 'lucide-react';
import { mockParts, mockSuppliers } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface SupplierStock {
  id: string;
  supplierId: string;
  supplierName: string;
  partId: string;
  partNumber: string;
  partName: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  lastUpdated: string;
}

// Generate mock supplier stocks
const generateMockStocks = (): SupplierStock[] => {
  const stocks: SupplierStock[] = [];
  mockSuppliers.forEach((supplier, sIndex) => {
    mockParts.slice(0, 5).forEach((part, pIndex) => {
      stocks.push({
        id: `stock-${sIndex}-${pIndex}`,
        supplierId: supplier.id,
        supplierName: supplier.nameAr,
        partId: part.id,
        partNumber: part.partNumber,
        partName: part.nameAr,
        quantity: Math.floor(Math.random() * 100) + 5,
        minQuantity: 10,
        maxQuantity: 150,
        unitPrice: part.price * (0.9 + Math.random() * 0.2),
        lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    });
  });
  return stocks;
};

const AdminSupplierStocks = () => {
  const { toast } = useToast();
  const [stocks, setStocks] = useState<SupplierStock[]>(generateMockStocks);
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('all');
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<SupplierStock | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');

  const filteredStocks = useMemo(() => {
    let results = stocks;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(s => 
        s.partNumber.toLowerCase().includes(query) ||
        s.partName.includes(searchQuery) ||
        s.supplierName.includes(searchQuery)
      );
    }
    
    if (supplierFilter !== 'all') {
      results = results.filter(s => s.supplierId === supplierFilter);
    }
    
    if (stockStatusFilter === 'low') {
      results = results.filter(s => s.quantity <= s.minQuantity);
    } else if (stockStatusFilter === 'high') {
      results = results.filter(s => s.quantity >= s.maxQuantity);
    } else if (stockStatusFilter === 'normal') {
      results = results.filter(s => s.quantity > s.minQuantity && s.quantity < s.maxQuantity);
    }
    
    return results;
  }, [stocks, searchQuery, supplierFilter, stockStatusFilter]);

  const stats = useMemo(() => {
    const lowStock = stocks.filter(s => s.quantity <= s.minQuantity).length;
    const highStock = stocks.filter(s => s.quantity >= s.maxQuantity).length;
    const totalValue = stocks.reduce((sum, s) => sum + (s.quantity * s.unitPrice), 0);
    
    return { lowStock, highStock, totalValue, totalItems: stocks.length };
  }, [stocks]);

  const handleAdjustStock = (stock: SupplierStock, type: 'add' | 'remove') => {
    setSelectedStock(stock);
    setAdjustmentType(type);
    setAdjustmentAmount('');
    setIsAdjustDialogOpen(true);
  };

  const handleSubmitAdjustment = () => {
    if (!selectedStock || !adjustmentAmount) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال الكمية',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseInt(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال كمية صحيحة',
        variant: 'destructive',
      });
      return;
    }

    setStocks(prev => prev.map(s => {
      if (s.id === selectedStock.id) {
        const newQuantity = adjustmentType === 'add' 
          ? s.quantity + amount 
          : Math.max(0, s.quantity - amount);
        return {
          ...s,
          quantity: newQuantity,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return s;
    }));

    toast({
      title: adjustmentType === 'add' ? 'تمت الإضافة' : 'تم الخصم',
      description: `تم ${adjustmentType === 'add' ? 'إضافة' : 'خصم'} ${amount} وحدة بنجاح`,
    });

    setIsAdjustDialogOpen(false);
    setSelectedStock(null);
    setAdjustmentAmount('');
  };

  const getStockStatus = (stock: SupplierStock) => {
    if (stock.quantity <= stock.minQuantity) {
      return { label: 'منخفض', variant: 'destructive' as const, icon: TrendingDown };
    }
    if (stock.quantity >= stock.maxQuantity) {
      return { label: 'مرتفع', variant: 'secondary' as const, icon: TrendingUp };
    }
    return { label: 'طبيعي', variant: 'default' as const, icon: Package };
  };

  const getStockPercentage = (stock: SupplierStock) => {
    return Math.min(100, (stock.quantity / stock.maxQuantity) * 100);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <Warehouse className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-l from-foreground to-foreground/70 bg-clip-text">
                مخزون الموردين
              </h1>
              <p className="text-muted-foreground">
                إدارة ومتابعة مخزون كل مورد
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الأصناف</p>
                  <p className="text-2xl font-bold">{stats.totalItems}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">مخزون منخفض</p>
                  <p className="text-2xl font-bold text-destructive">{stats.lowStock}</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">مخزون مرتفع</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.highStock}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-100">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                  <p className="text-2xl font-bold text-success">{stats.totalValue.toLocaleString('ar-SA', { maximumFractionDigits: 0 })} ر.س</p>
                </div>
                <div className="p-3 rounded-xl bg-green-100">
                  <Warehouse className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث برقم القطعة أو الاسم أو المورد..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-background"
                />
              </div>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <SelectValue placeholder="جميع الموردين" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الموردين</SelectItem>
                  {mockSuppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px] bg-background">
                  <SelectValue placeholder="حالة المخزون" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="normal">طبيعي</SelectItem>
                  <SelectItem value="high">مرتفع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stocks Table */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-right font-semibold">القطعة</TableHead>
                    <TableHead className="text-right font-semibold">المورد</TableHead>
                    <TableHead className="text-right font-semibold">الكمية</TableHead>
                    <TableHead className="text-right font-semibold">مستوى المخزون</TableHead>
                    <TableHead className="text-right font-semibold">سعر الوحدة</TableHead>
                    <TableHead className="text-right font-semibold">آخر تحديث</TableHead>
                    <TableHead className="text-right font-semibold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.slice(0, 15).map((stock) => {
                    const status = getStockStatus(stock);
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={stock.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-medium">{stock.partName}</p>
                            <p className="text-sm text-muted-foreground font-mono">{stock.partNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {stock.supplierName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4 ${
                              status.variant === 'destructive' ? 'text-destructive' :
                              status.variant === 'secondary' ? 'text-amber-600' : 'text-primary'
                            }`} />
                            <span className="font-bold">{stock.quantity}</span>
                            <span className="text-muted-foreground text-sm">
                              / {stock.minQuantity}-{stock.maxQuantity}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[180px]">
                          <div className="space-y-1.5">
                            <Progress 
                              value={getStockPercentage(stock)} 
                              className={`h-2 ${
                                stock.quantity <= stock.minQuantity ? '[&>div]:bg-destructive' :
                                stock.quantity >= stock.maxQuantity ? '[&>div]:bg-amber-500' : ''
                              }`}
                            />
                            <Badge variant={status.variant} className="text-xs">
                              {status.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {stock.unitPrice.toFixed(2)} ر.س
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {stock.lastUpdated}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleAdjustStock(stock, 'add')}
                            >
                              <PackagePlus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleAdjustStock(stock, 'remove')}
                            >
                              <PackageMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {filteredStocks.length > 15 && (
              <div className="p-4 text-center text-muted-foreground border-t bg-muted/20">
                عرض 15 من {filteredStocks.length} صنف
              </div>
            )}
          </CardContent>
        </Card>

        {/* Adjust Stock Dialog */}
        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {adjustmentType === 'add' ? (
                  <PackagePlus className="h-5 w-5 text-green-600" />
                ) : (
                  <PackageMinus className="h-5 w-5 text-red-600" />
                )}
                {adjustmentType === 'add' ? 'إضافة للمخزون' : 'خصم من المخزون'}
              </DialogTitle>
              <DialogDescription>
                {selectedStock?.partName} - {selectedStock?.supplierName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground mb-1">الكمية الحالية</p>
                <p className="text-3xl font-bold">{selectedStock?.quantity}</p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="amount">الكمية المراد {adjustmentType === 'add' ? 'إضافتها' : 'خصمها'}</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="أدخل الكمية"
                  className="text-center text-lg"
                />
              </div>
              
              {adjustmentAmount && selectedStock && (
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground mb-1">الكمية بعد التعديل</p>
                  <p className={`text-3xl font-bold ${adjustmentType === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                    {adjustmentType === 'add' 
                      ? selectedStock.quantity + (parseInt(adjustmentAmount) || 0)
                      : Math.max(0, selectedStock.quantity - (parseInt(adjustmentAmount) || 0))
                    }
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={handleSubmitAdjustment}
                className={adjustmentType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {adjustmentType === 'add' ? 'إضافة' : 'خصم'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSupplierStocks;
