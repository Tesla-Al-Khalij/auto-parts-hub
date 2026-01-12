import { Link } from 'react-router-dom';
import { ChevronLeft, FileEdit, Send } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const formattedDate = new Date(order.date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className={cn(
      'overflow-hidden transition-all hover:shadow-md',
      order.isDraft && 'border-warning/50 bg-warning/5'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">
                {order.orderNumber}
              </h3>
              {order.isDraft && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  <FileEdit className="h-3 w-3 ml-1" />
                  مسودة
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items summary */}
        <div className="space-y-2">
          {order.items.slice(0, 2).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">{item.total.toLocaleString('ar-SA')} ر.س</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-sm text-muted-foreground">
              و {order.items.length - 2} قطع أخرى...
            </p>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="font-medium">الإجمالي (شامل الضريبة)</span>
          <span className="text-xl font-bold text-primary">
            {order.total.toLocaleString('ar-SA')} ر.س
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {order.isDraft ? (
            <>
              <Button variant="default" className="flex-1 h-12 gap-2">
                <Send className="h-4 w-4" />
                إرسال الطلب
              </Button>
              <Link to={`/orders/${order.id}`} className="flex-1">
                <Button variant="outline" className="w-full h-12 gap-2">
                  <FileEdit className="h-4 w-4" />
                  تعديل
                </Button>
              </Link>
            </>
          ) : (
            <Link to={`/orders/${order.id}`} className="w-full">
              <Button variant="outline" className="w-full h-12 gap-2">
                عرض التفاصيل
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
