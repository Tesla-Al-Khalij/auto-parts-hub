import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { mockParts, mockOrders, mockSuppliers } from '@/data/mockData';

const AdminDashboard = () => {
  // Calculate stats from mock data
  const totalParts = mockParts.length;
  const lowStockParts = mockParts.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockParts = mockParts.filter(p => p.stock <= 0).length;
  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const totalRevenue = mockOrders.reduce((sum, o) => sum + o.total, 0);
  const totalSuppliers = mockSuppliers.length;

  const stats = [
    {
      title: 'إجمالي القطع',
      value: totalParts,
      description: `${outOfStockParts} غير متوفر`,
      icon: Package,
      trend: 'up',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'الطلبات',
      value: totalOrders,
      description: `${pendingOrders} قيد الانتظار`,
      icon: ShoppingCart,
      trend: 'up',
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'الإيرادات',
      value: `${totalRevenue.toLocaleString('ar-SA')} ر.س`,
      description: 'هذا الشهر',
      icon: DollarSign,
      trend: 'up',
      color: 'text-amber-600 bg-amber-100',
    },
    {
      title: 'الموردين',
      value: totalSuppliers,
      description: 'مورد نشط',
      icon: Truck,
      trend: 'neutral',
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  const recentOrders = mockOrders.slice(0, 5);
  const lowStockItems = mockParts.filter(p => p.stock > 0 && p.stock <= 10).slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">مرحباً بك في لوحة إدارة المتجر</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {stat.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                أحدث الطلبات
              </CardTitle>
              <CardDescription>آخر 5 طلبات تم استلامها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{order.total.toLocaleString('ar-SA')} ر.س</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status === 'delivered' && 'تم التسليم'}
                        {order.status === 'shipped' && 'تم الشحن'}
                        {order.status === 'pending' && 'قيد الانتظار'}
                        {order.status === 'confirmed' && 'مؤكد'}
                        {order.status === 'cancelled' && 'ملغي'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                تنبيه المخزون المنخفض
              </CardTitle>
              <CardDescription>قطع تحتاج إلى إعادة تعبئة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((part) => (
                    <div 
                      key={part.id} 
                      className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                    >
                      <div>
                        <p className="font-medium">{part.nameAr}</p>
                        <p className="text-sm text-muted-foreground">{part.partNumber}</p>
                      </div>
                      <div className="text-left">
                        <span className="text-lg font-bold text-amber-600">{part.stock}</span>
                        <p className="text-xs text-muted-foreground">{part.unit}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد قطع بمخزون منخفض
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
