import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileEdit, Send, Save, FileText, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useDraftOrder } from '@/contexts/DraftOrderContext';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const [notes, setNotes] = useState(order.notes || '');
  const [showNotes, setShowNotes] = useState(false);
  const { toast } = useToast();
  const { setDraftOrder, setReorderItems } = useDraftOrder();
  const navigate = useNavigate();

  const handleEditDraft = () => {
    setDraftOrder(order);
    navigate('/');
  };

  const handleReorder = () => {
    setReorderItems(order);
    navigate('/');
    toast({
      title: 'إعادة الطلب',
      description: `تم نسخ ${order.items.length} قطعة إلى طلب جديد`,
    });
  };

  const formattedDate = new Date(order.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleSaveAsDraft = () => {
    console.log('Saving as draft:', { orderId: order.id, notes });
    toast({
      title: 'تم حفظ المسودة',
      description: `تم حفظ الطلب ${order.orderNumber} كمسودة`,
    });
  };

  const handleSendOrder = () => {
    console.log('Sending order:', { orderId: order.id, notes });
    toast({
      title: 'تم إرسال الطلب',
      description: `تم إرسال الطلب ${order.orderNumber} للمورد`,
    });
  };

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
              <span className="font-medium">{item.total.toLocaleString('en-US')} ر.س</span>
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
            {order.total.toLocaleString('en-US')} ر.س
          </span>
        </div>

        {/* Notes section for drafts */}
        {order.isDraft && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setShowNotes(!showNotes)}
            >
              <FileText className="h-4 w-4" />
              {showNotes ? 'إخفاء الملاحظات' : 'إضافة ملاحظات'}
            </Button>
            {showNotes && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظات للمورد..."
                className="w-full min-h-[60px] p-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                dir="rtl"
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {order.isDraft ? (
            <>
              <Button 
                variant="default" 
                className="flex-1 h-12 gap-2"
                onClick={handleSendOrder}
              >
                <Send className="h-4 w-4" />
                إرسال الطلب
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-12 gap-2"
                onClick={handleEditDraft}
              >
                <FileEdit className="h-4 w-4" />
                تعديل
              </Button>
            </>
          ) : (
            <div className="flex gap-2 w-full">
              <Link to={`/orders/${order.id}`} className="flex-1">
                <Button variant="outline" className="w-full h-12 gap-2">
                  عرض التفاصيل
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="secondary" 
                className="h-12 gap-2"
                onClick={handleReorder}
              >
                <RotateCcw className="h-4 w-4" />
                إعادة الطلب
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
