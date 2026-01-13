import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Package, MapPin, Clock, CheckCircle, Truck, Home, Phone, Copy, Printer } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { mockOrders } from '@/data/mockData';
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const statusSteps: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: 'pending', label: 'قيد الانتظار', icon: Clock },
  { status: 'confirmed', label: 'تم التأكيد', icon: CheckCircle },
  { status: 'shipped', label: 'تم الشحن', icon: Truck },
  { status: 'delivered', label: 'تم التسليم', icon: Home },
];

const getStepIndex = (status: OrderStatus) => {
  if (status === 'cancelled') return -1;
  return statusSteps.findIndex(s => s.status === status);
};

export default function OrderDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const order = mockOrders.find(o => o.id === id);

  if (!order) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-bold mb-2">الطلب غير موجود</h2>
          <p className="text-muted-foreground mb-4">لم يتم العثور على الطلب المطلوب</p>
          <Link to="/orders">
            <Button className="gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة للطلبات
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const currentStepIndex = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  const formattedDate = new Date(order.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    toast({ title: 'تم النسخ', description: 'تم نسخ رقم الطلب' });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back button */}
        <Link to="/orders">
          <Button variant="ghost" className="gap-2">
            <ArrowRight className="h-5 w-5" />
            العودة للطلبات
          </Button>
        </Link>

        {/* Order Info Grid */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Order Number */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">رقم الطلب</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg">{order.orderNumber}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyOrderNumber}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                <p className="font-bold text-lg">{formattedDate}</p>
              </div>

              {/* Items Count */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">عدد القطع</p>
                <p className="font-bold text-lg">{order.items.length} قطع</p>
              </div>

              {/* Total */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">الإجمالي</p>
                <p className="font-bold text-lg text-primary">{order.total.toLocaleString('en-US')} ر.س</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <OrderStatusBadge status={order.status} size="lg" />
              <Button variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                طباعة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order tracking timeline */}
        {!order.isDraft && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                تتبع الطلب
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCancelled ? (
                <div className="flex items-center justify-center py-8 text-destructive">
                  <div className="text-center">
                    <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-destructive/10 mb-3">
                      <Package className="h-8 w-8" />
                    </div>
                    <p className="font-medium text-lg">تم إلغاء الطلب</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute top-8 right-8 left-8 h-1 bg-muted rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;

                      return (
                        <div key={step.status} className="flex flex-col items-center">
                          <div
                            className={cn(
                              'flex h-16 w-16 items-center justify-center rounded-full border-4 transition-all',
                              isCompleted 
                                ? 'bg-primary border-primary text-primary-foreground' 
                                : 'bg-card border-muted text-muted-foreground',
                              isCurrent && 'ring-4 ring-primary/20'
                            )}
                          >
                            <Icon className="h-7 w-7" />
                          </div>
                          <p className={cn(
                            'mt-3 text-sm font-medium text-center',
                            isCompleted ? 'text-primary' : 'text-muted-foreground'
                          )}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <span className="text-xs text-muted-foreground mt-1">الحالة الحالية</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order items - Grid style like QuickOrderGrid */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الطلب ({order.items.length} قطع)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Grid */}
            <div className="hidden md:block">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                <div className="col-span-3 text-right">رقم القطعة</div>
                <div className="col-span-4 text-right">اسم القطعة</div>
                <div className="col-span-1 text-center">الكمية</div>
                <div className="col-span-2 text-left">السعر</div>
                <div className="col-span-2 text-left">المجموع</div>
              </div>
              
              {/* Rows */}
              {order.items.map((item, index) => (
                <div 
                  key={index}
                  className={cn(
                    "grid grid-cols-12 gap-2 px-4 py-3 items-center border-b last:border-b-0",
                    index % 2 === 0 ? "bg-background" : "bg-muted/30"
                  )}
                >
                  <div className="col-span-3">
                    <code className="text-primary bg-primary/10 px-2 py-1 rounded text-sm font-bold">
                      {item.partNumber}
                    </code>
                  </div>
                  <div className="col-span-4 font-medium text-right">
                    {item.name}
                  </div>
                  <div className="col-span-1 text-center">
                    <Badge variant="secondary" className="font-bold">
                      {item.quantity}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-left text-muted-foreground">
                    {item.unitPrice.toLocaleString('en-US')} ر.س
                  </div>
                  <div className="col-span-2 text-left font-bold text-primary">
                    {item.total.toLocaleString('en-US')} ر.س
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {order.items.map((item, index) => (
                <div key={index} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-primary bg-primary/10 px-2 py-1 rounded text-sm font-bold">
                      {item.partNumber}
                    </code>
                    <Badge variant="secondary" className="font-bold">
                      {item.quantity} ×
                    </Badge>
                  </div>
                  <p className="font-medium">{item.name}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.unitPrice.toLocaleString('en-US')} × {item.quantity}
                    </span>
                    <span className="font-bold text-primary">
                      {item.total.toLocaleString('en-US')} ر.س
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Totals */}
            <div className="space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع الفرعي</span>
                <span>{order.subtotal.toLocaleString('en-US')} ر.س</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>ضريبة القيمة المضافة (15%)</span>
                <span>{order.vat.toLocaleString('en-US')} ر.س</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>الإجمالي</span>
                <span className="text-primary">{order.total.toLocaleString('en-US')} ر.س</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle>ملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Contact support */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">هل تحتاج مساعدة؟</p>
                  <p className="text-sm text-muted-foreground">تواصل معنا للاستفسار عن طلبك</p>
                </div>
              </div>
              <Button size="lg" className="gap-2">
                <Phone className="h-5 w-5" />
                اتصل بنا
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
