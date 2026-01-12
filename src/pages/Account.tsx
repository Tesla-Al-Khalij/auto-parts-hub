import { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  CreditCard,
  Calendar,
  AlertTriangle,
  Clock,
  Banknote,
  ChevronDown,
  Info
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionRow } from '@/components/account/TransactionRow';
import { mockTransactions, mockUserProfile } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Helper to get week number
const getWeekNumber = (date: Date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

// Helper to get start and end of current week (Saturday to Friday for Saudi week)
const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  // Saturday is 6, we want to go back to last Saturday
  const diff = day === 6 ? 0 : day + 1;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

// Get last week range
const getLastWeekRange = () => {
  const { startOfWeek } = getCurrentWeekRange();
  const lastWeekEnd = new Date(startOfWeek);
  lastWeekEnd.setDate(startOfWeek.getDate() - 1);
  lastWeekEnd.setHours(23, 59, 59, 999);
  
  const lastWeekStart = new Date(lastWeekEnd);
  lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
  lastWeekStart.setHours(0, 0, 0, 0);
  
  return { startOfWeek: lastWeekStart, endOfWeek: lastWeekEnd };
};

export default function Account() {
  const [activeTab, setActiveTab] = useState('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  // Available years from transactions
  const years = useMemo(() => {
    const yearsSet = new Set(mockTransactions.map(t => new Date(t.date).getFullYear()));
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, []);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let results = mockTransactions;

    // Filter by type
    if (activeTab !== 'all') {
      results = results.filter(t => t.type === activeTab);
    }

    // Filter by year
    if (yearFilter !== 'all') {
      results = results.filter(t => new Date(t.date).getFullYear() === parseInt(yearFilter));
    }

    // Filter by month
    if (monthFilter !== 'all') {
      results = results.filter(t => new Date(t.date).getMonth() === parseInt(monthFilter));
    }

    // Sort by date descending
    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeTab, yearFilter, monthFilter]);

  // Calculate totals for filtered period
  const periodStats = useMemo(() => {
    const sales = filteredTransactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const returns = filteredTransactions
      .filter(t => t.type === 'return')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const payments = filteredTransactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);

    return { sales, returns, payments };
  }, [filteredTransactions]);

  // Calculate this week's purchases (will count from next week)
  const thisWeekPurchases = useMemo(() => {
    const { startOfWeek, endOfWeek } = getCurrentWeekRange();
    return mockTransactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'sale' && date >= startOfWeek && date <= endOfWeek;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, []);

  // Calculate required weekly transfer based on last week's purchases
  const requiredWeeklyTransfer = useMemo(() => {
    const { startOfWeek, endOfWeek } = getLastWeekRange();
    return mockTransactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'sale' && date >= startOfWeek && date <= endOfWeek;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, []);

  // Calculate due amount based on credit terms
  const dueAmount = useMemo(() => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - mockUserProfile.creditTermDays);
    
    return mockTransactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'sale' && date <= dueDate;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, []);

  // Credit usage percentage
  const creditUsagePercent = (mockUserProfile.usedCredit / mockUserProfile.creditLimit) * 100;
  const availableCredit = mockUserProfile.creditLimit - mockUserProfile.usedCredit;

  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">كشف الحساب</h1>
              <p className="text-muted-foreground">عرض جميع المعاملات المالية</p>
            </div>
          </div>
          <Button variant="outline" size="lg" className="gap-2">
            <Download className="h-5 w-5" />
            تصدير PDF
          </Button>
        </div>

        {/* Weekly Transfer Alert */}
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/20">
                  <Banknote className="h-8 w-8 text-warning" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground">التحويل المطلوب هذا الأسبوع</h3>
                    <Badge variant="outline" className="text-warning border-warning">
                      مستحق
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    بناءً على مشتريات الأسبوع الماضي
                  </p>
                  <p className="text-3xl font-bold text-warning">
                    {requiredWeeklyTransfer.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-lg">ر.س</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                <div className="bg-background rounded-lg p-4 text-center min-w-[140px]">
                  <p className="text-sm text-muted-foreground mb-1">مشتريات هذا الأسبوع</p>
                  <p className="text-xl font-bold text-foreground">
                    {thisWeekPurchases.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Info className="h-3 w-3 inline ml-1" />
                    تحتسب من الأسبوع القادم
                  </p>
                </div>
                
                {dueAmount > 0 && (
                  <div className="bg-destructive/10 rounded-lg p-4 text-center min-w-[140px]">
                    <p className="text-sm text-muted-foreground mb-1">مبالغ متأخرة</p>
                    <p className="text-xl font-bold text-destructive">
                      {dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                    </p>
                    <p className="text-xs text-destructive mt-1">
                      <AlertTriangle className="h-3 w-3 inline ml-1" />
                      تجاوزت {mockUserProfile.creditTermDays} يوم
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              حالة الائتمان
            </CardTitle>
            <CardDescription>
              شروط الدفع: <Badge variant="secondary">{mockUserProfile.creditTermDays} يوم</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">الائتمان المستخدم</span>
              <span className="font-bold">
                {mockUserProfile.usedCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })} / {mockUserProfile.creditLimit.toLocaleString('en-US')} ر.س
              </span>
            </div>
            <Progress 
              value={creditUsagePercent} 
              className={cn(
                "h-3",
                creditUsagePercent > 90 ? "[&>div]:bg-destructive" : 
                creditUsagePercent > 70 ? "[&>div]:bg-warning" : "[&>div]:bg-success"
              )}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {creditUsagePercent > 90 ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : creditUsagePercent > 70 ? (
                  <Clock className="h-4 w-4 text-warning" />
                ) : (
                  <Wallet className="h-4 w-4 text-success" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  creditUsagePercent > 90 ? "text-destructive" : 
                  creditUsagePercent > 70 ? "text-warning" : "text-success"
                )}>
                  {creditUsagePercent > 90 ? 'الائتمان شارف على النفاد' : 
                   creditUsagePercent > 70 ? 'الائتمان منخفض' : 'الائتمان متاح'}
                </span>
              </div>
              <span className="text-lg font-bold text-success">
                متاح: {availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                  <Wallet className="h-7 w-7 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
                  <p className="text-2xl font-bold text-success">
                    {mockUserProfile.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                  <TrendingDown className="h-7 w-7 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
                  <p className="text-2xl font-bold text-destructive">
                    {periodStats.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
                  <TrendingUp className="h-7 w-7 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المرتجعات</p>
                  <p className="text-2xl font-bold text-warning">
                    {periodStats.returns.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المدفوعات</p>
                  <p className="text-2xl font-bold text-primary">
                    {periodStats.payments.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>سجل المعاملات</CardTitle>
              
              {/* Date filters */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="السنة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل السنوات</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="الشهر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الشهور</SelectItem>
                    {months.map((month, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(yearFilter !== 'all' || monthFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setYearFilter('all');
                      setMonthFilter('all');
                    }}
                  >
                    مسح
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full h-auto p-1 grid grid-cols-4 mb-6">
                <TabsTrigger value="all" className="h-12 text-base">
                  الكل
                </TabsTrigger>
                <TabsTrigger value="sale" className="h-12 text-base">
                  المبيعات
                </TabsTrigger>
                <TabsTrigger value="return" className="h-12 text-base">
                  المرتجعات
                </TabsTrigger>
                <TabsTrigger value="payment" className="h-12 text-base">
                  المدفوعات
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد معاملات في هذه الفترة</p>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground mb-4">
                      عدد المعاملات: <strong className="text-foreground">{filteredTransactions.length}</strong>
                    </div>
                    <div className="divide-y divide-border">
                      {filteredTransactions.map(transaction => (
                        <TransactionRow key={transaction.id} transaction={transaction} />
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
