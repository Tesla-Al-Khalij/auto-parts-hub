import { Package, MapPin, Clock, CheckCircle, Truck, Home, Phone, Copy, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Order, OrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  const { toast } = useToast();

  if (!order) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            تفاصيل الطلب
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="space-y-4 p-6 pt-4">
            {/* Order Info Grid */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Order Number */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">رقم الطلب</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{order.orderNumber}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyOrderNumber}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                    <p className="font-bold">{formattedDate}</p>
                  </div>

                  {/* Items Count */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">عدد القطع</p>
                    <p className="font-bold">{order.items.length} قطع</p>
                  </div>

                  {/* Total */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">الإجمالي</p>
                    <p className="font-bold text-primary">{order.total.toLocaleString('en-US')} ر.س</p>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <OrderStatusBadge status={order.status} size="lg" />
                  <Button variant="outline" size="sm" className="gap-2">
                    <Printer className="h-4 w-4" />
                    طباعة
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Order tracking timeline */}
            {!order.isDraft && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    تتبع الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  {isCancelled ? (
                    <div className="flex items-center justify-center py-6 text-destructive">
                      <div className="text-center">
                        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-destructive/10 mb-2">
                          <Package className="h-6 w-6" />
                        </div>
                        <p className="font-medium">تم إلغاء الطلب</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Progress line */}
                      <div className="absolute top-6 right-6 left-6 h-1 bg-muted rounded-full">
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
                                  'flex h-12 w-12 items-center justify-center rounded-full border-3 transition-all',
                                  isCompleted 
                                    ? 'bg-primary border-primary text-primary-foreground' 
                                    : 'bg-card border-muted text-muted-foreground',
                                  isCurrent && 'ring-3 ring-primary/20'
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <p className={cn(
                                'mt-2 text-xs font-medium text-center',
                                isCompleted ? 'text-primary' : 'text-muted-foreground'
                              )}>
                                {step.label}
                              </p>
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
              <CardHeader className="py-3">
                <CardTitle className="text-base">تفاصيل الطلب ({order.items.length} قطع)</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="space-y-1">
                        <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs font-bold">
                          {item.partNumber}
                        </code>
                        <p className="font-medium text-sm">{item.name}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-muted-foreground">
                          {item.unitPrice.toLocaleString('en-US')} × {item.quantity}
                        </p>
                        <p className="font-bold">{item.total.toLocaleString('en-US')} ر.س</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>المجموع الفرعي</span>
                    <span>{order.subtotal.toLocaleString('en-US')} ر.س</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>ضريبة القيمة المضافة (15%)</span>
                    <span>{order.vat.toLocaleString('en-US')} ر.س</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي</span>
                    <span className="text-primary">{order.total.toLocaleString('en-US')} ر.س</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">ملاحظات</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Contact support */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">هل تحتاج مساعدة؟</p>
                      <p className="text-xs text-muted-foreground">تواصل معنا للاستفسار عن طلبك</p>
                    </div>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Phone className="h-4 w-4" />
                    اتصل بنا
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
