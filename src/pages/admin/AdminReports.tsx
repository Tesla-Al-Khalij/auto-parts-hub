import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  ShoppingCart,
  Users,
  DollarSign
} from 'lucide-react';
import { mockOrders, mockParts } from '@/data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const AdminReports = () => {
  // Sales by month
  const salesByMonth = [
    { month: 'يناير', sales: 12500 },
    { month: 'فبراير', sales: 15800 },
    { month: 'مارس', sales: 18200 },
    { month: 'أبريل', sales: 14300 },
    { month: 'مايو', sales: 19500 },
    { month: 'يونيو', sales: 22100 },
  ];

  // Category distribution
  const categoryData = mockParts.reduce((acc, part) => {
    const existing = acc.find(c => c.name === part.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: part.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const categoryLabels: Record<string, string> = {
    engine: 'المحرك',
    brakes: 'الفرامل',
    filters: 'الفلاتر',
    electrical: 'الكهرباء',
    cooling: 'التبريد',
    transmission: 'ناقل الحركة',
    body: 'البودي',
    sensors: 'الحساسات',
    oils: 'الزيوت',
    accessories: 'الإكسسوارات',
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'];

  // Order status distribution
  const orderStatusData = mockOrders.reduce((acc, order) => {
    const existing = acc.find(s => s.name === order.status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: order.status, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
  };

  // Summary stats
  const totalRevenue = mockOrders.reduce((sum, o) => sum + o.total, 0);
  const totalParts = mockParts.length;
  const totalOrders = mockOrders.length;
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            التقارير والإحصائيات
          </h1>
          <p className="text-muted-foreground mt-1">
            نظرة عامة على أداء المتجر
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي الإيرادات
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue.toLocaleString('ar-SA')} ر.س
              </div>
              <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +12% من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي الطلبات
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                متوسط قيمة الطلب: {avgOrderValue.toFixed(0)} ر.س
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                القطع المتوفرة
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalParts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {mockParts.filter(p => p.stock <= 0).length} غير متوفر
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                العملاء النشطين
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +8 عميل جديد هذا الشهر
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>المبيعات الشهرية</CardTitle>
              <CardDescription>إجمالي المبيعات خلال آخر 6 أشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} ر.س`, 'المبيعات']}
                      contentStyle={{ direction: 'rtl' }}
                    />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع القطع حسب التصنيف</CardTitle>
              <CardDescription>عدد القطع في كل تصنيف</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${categoryLabels[name] || name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, categoryLabels[name as string] || name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>حالة الطلبات</CardTitle>
              <CardDescription>توزيع الطلبات حسب الحالة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${statusLabels[name] || name}: ${value}`}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, statusLabels[name as string] || name]}
                    />
                    <Legend formatter={(value) => statusLabels[value] || value} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>أكثر القطع مبيعاً</CardTitle>
              <CardDescription>القطع الأكثر طلباً</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockParts.slice(0, 5).map((part, index) => (
                  <div key={part.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{part.nameAr}</p>
                      <p className="text-sm text-muted-foreground">{part.partNumber}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{part.price.toFixed(2)} ر.س</p>
                      <p className="text-sm text-muted-foreground">{part.stock} متوفر</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
