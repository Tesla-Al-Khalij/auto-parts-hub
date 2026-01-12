import { useState } from 'react';
import { Package, Search, Filter } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCard } from '@/components/orders/OrderCard';
import { mockOrders } from '@/data/mockData';

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => 
        item.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.includes(searchQuery)
      );

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'drafts') return matchesSearch && order.isDraft;
    if (activeTab === 'active') return matchesSearch && !order.isDraft && ['pending', 'confirmed', 'shipped'].includes(order.status);
    if (activeTab === 'completed') return matchesSearch && ['delivered', 'cancelled'].includes(order.status);
    return matchesSearch;
  });

  const draftsCount = mockOrders.filter(o => o.isDraft).length;
  const activeCount = mockOrders.filter(o => !o.isDraft && ['pending', 'confirmed', 'shipped'].includes(o.status)).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">طلباتي</h1>
            <p className="text-muted-foreground">عرض وتتبع جميع طلباتك</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ابحث برقم الطلب أو رقم القطعة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pr-12"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-auto p-1 grid grid-cols-4">
            <TabsTrigger value="all" className="h-12 text-base">
              الكل ({mockOrders.length})
            </TabsTrigger>
            <TabsTrigger value="drafts" className="h-12 text-base">
              المسودات ({draftsCount})
            </TabsTrigger>
            <TabsTrigger value="active" className="h-12 text-base">
              النشطة ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="completed" className="h-12 text-base">
              المكتملة
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredOrders.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  لا توجد طلبات
                </h3>
                <p className="text-muted-foreground">
                  لم يتم العثور على طلبات مطابقة
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
