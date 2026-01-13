import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  AlertTriangle,
  ArrowUpLeft,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Boxes
} from 'lucide-react';
import { mockParts, mockOrders, mockSuppliers } from '@/data/mockData';
import { Link } from 'react-router-dom';

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
      trend: '+12%',
      trendUp: true,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-500/10 to-blue-600/5',
    },
    {
      title: 'الطلبات',
      value: totalOrders,
      description: `${pendingOrders} قيد الانتظار`,
      icon: ShoppingCart,
      trend: '+8%',
      trendUp: true,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-500/10 to-emerald-600/5',
    },
    {
      title: 'الإيرادات',
      value: `${totalRevenue.toLocaleString('ar-SA')}`,
      suffix: 'ر.س',
      description: 'هذا الشهر',
      icon: DollarSign,
      trend: '+23%',
      trendUp: true,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/10 to-orange-500/5',
    },
    {
      title: 'الموردين',
      value: totalSuppliers,
      description: 'مورد نشط',
      icon: Truck,
      trend: '0%',
      trendUp: null,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-500/10 to-purple-600/5',
    },
  ];

  const recentOrders = mockOrders.slice(0, 5);
  const lowStockItems = mockParts.filter(p => p.stock > 0 && p.stock <= 10).slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'تم التسليم';
      case 'shipped': return 'تم الشحن';
      case 'pending': return 'قيد الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Boxes className="h-4 w-4" />
              <span>نظام إدارة المخزون</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              مرحباً بك في لوحة التحكم
            </h1>
            <p className="text-muted-foreground">
              إليك نظرة عامة على أداء متجرك اليوم
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/admin/parts">
              <Button variant="outline" className="gap-2">
                <Package className="h-4 w-4" />
                إدارة القطع
              </Button>
            </Link>
            <Link to="/admin/orders">
              <Button className="gap-2 shadow-lg shadow-primary/25">
                <ShoppingCart className="h-4 w-4" />
                الطلبات الجديدة
                {pendingOrders > 0 && (
                  <Badge variant="secondary" className="bg-white/20 text-white mr-1">
                    {pendingOrders}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title} 
              className={`relative overflow-hidden border-0 shadow-lg bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Decorative gradient circle */}
              <div className={`absolute -top-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`} />
              
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
                      {stat.suffix && (
                        <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {stat.trendUp !== null && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs font-medium ${
                            stat.trendUp 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {stat.trendUp ? <TrendingUp className="h-3 w-3 ml-1" /> : <TrendingDown className="h-3 w-3 ml-1" />}
                          {stat.trend}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{stat.description}</span>
                    </div>
                  </div>
                  
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Recent Orders - Takes 3 columns */}
          <Card className="lg:col-span-3 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">أحدث الطلبات</CardTitle>
                    <CardDescription>آخر 5 طلبات تم استلامها</CardDescription>
                  </div>
                </div>
                <Link to="/admin/orders">
                  <Button variant="ghost" size="sm" className="gap-1 text-primary">
                    عرض الكل
                    <ArrowUpLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentOrders.map((order, index) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{order.items.length} قطعة</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="font-bold">{order.total.toLocaleString('ar-SA')} ر.س</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                      
                      <Badge 
                        variant="secondary" 
                        className="gap-1.5 min-w-[100px] justify-center"
                      >
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </Badge>
                      
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert - Takes 2 columns */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">تنبيه المخزون</CardTitle>
                    <CardDescription>قطع تحتاج لإعادة تعبئة</CardDescription>
                  </div>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {lowStockParts} قطعة
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((part) => (
                    <div 
                      key={part.id} 
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{part.nameAr}</p>
                        <p className="text-xs text-muted-foreground font-mono">{part.partNumber}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <div className="flex items-center gap-1">
                            <span className={`text-xl font-bold ${
                              part.stock <= 5 ? 'text-red-500' : 'text-amber-500'
                            }`}>
                              {part.stock}
                            </span>
                            <span className="text-xs text-muted-foreground">{part.unit}</span>
                          </div>
                        </div>
                        <div className={`h-2 w-2 rounded-full ${
                          part.stock <= 5 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                        }`} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
                    <p className="text-muted-foreground">لا توجد قطع بمخزون منخفض</p>
                  </div>
                )}
              </div>
              
              {lowStockItems.length > 0 && (
                <div className="p-4 border-t">
                  <Link to="/admin/parts">
                    <Button variant="outline" className="w-full gap-2">
                      <Package className="h-4 w-4" />
                      إدارة المخزون
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Bar */}
        <Card className="border-0 shadow-lg bg-gradient-to-l from-primary/5 via-background to-primary/5">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-primary">{outOfStockParts}</p>
                <p className="text-sm text-muted-foreground">قطع نفذت</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-emerald-500">{mockOrders.filter(o => o.status === 'delivered').length}</p>
                <p className="text-sm text-muted-foreground">طلبات مكتملة</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-amber-500">{lowStockParts}</p>
                <p className="text-sm text-muted-foreground">مخزون منخفض</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-violet-500">{mockOrders.filter(o => o.isDraft).length}</p>
                <p className="text-sm text-muted-foreground">مسودات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
