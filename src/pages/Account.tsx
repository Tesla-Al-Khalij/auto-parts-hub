import { useState } from 'react';
import { FileText, Download, Filter, Wallet, TrendingDown, TrendingUp, CreditCard } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionRow } from '@/components/account/TransactionRow';
import { mockTransactions, mockUserProfile } from '@/data/mockData';

export default function Account() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredTransactions = mockTransactions.filter(t => {
    if (activeTab === 'all') return true;
    return t.type === activeTab;
  });

  const totalSales = mockTransactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalReturns = mockTransactions
    .filter(t => t.type === 'return')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayments = mockTransactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
                    {mockUserProfile.balance.toLocaleString('ar-SA')} ر.س
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
                    {totalSales.toLocaleString('ar-SA')} ر.س
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
                    {totalReturns.toLocaleString('ar-SA')} ر.س
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
                    {totalPayments.toLocaleString('ar-SA')} ر.س
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>سجل المعاملات</CardTitle>
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
                <div className="divide-y divide-border">
                  {filteredTransactions.map(transaction => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
