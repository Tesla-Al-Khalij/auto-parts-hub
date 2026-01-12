import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Package, MapPin, Clock, CheckCircle, Truck, Home, Phone, Copy, Printer } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

  const formattedDate = new Date(order.date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
              <Button variant="ghost" size="icon" onClick={copyOrderNumber}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} size="lg" />
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              طباعة
            </Button>
          </div>
        </div>

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

        {/* Order items */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الطلب ({order.items.length} قطع)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-sm font-bold">
                      {item.partNumber}
                    </code>
                    <p className="font-medium">{item.name}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">
                      {item.unitPrice.toLocaleString('ar-SA')} × {item.quantity}
                    </p>
                    <p className="font-bold text-lg">{item.total.toLocaleString('ar-SA')} ر.س</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Totals */}
            <div className="space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع الفرعي</span>
                <span>{order.subtotal.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>ضريبة القيمة المضافة (15%)</span>
                <span>{order.vat.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>الإجمالي</span>
                <span className="text-primary">{order.total.toLocaleString('ar-SA')} ر.س</span>
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
