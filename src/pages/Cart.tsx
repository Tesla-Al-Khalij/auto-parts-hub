import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Send, Save } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, vat, total } = useCart();
  const { toast } = useToast();

  const handleSendOrder = () => {
    toast({
      title: 'تم إرسال الطلب بنجاح',
      description: 'سيتم مراجعة طلبك وإرسال تأكيد قريباً',
    });
    clearCart();
  };

  const handleSaveDraft = () => {
    toast({
      title: 'تم حفظ المسودة',
      description: 'يمكنك إكمال الطلب لاحقاً من صفحة الطلبات',
    });
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">السلة فارغة</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            لم تقم بإضافة أي قطع بعد. ابدأ بالبحث عن قطع الغيار المطلوبة
          </p>
          <Link to="/">
            <Button size="lg" className="h-14 px-8 text-lg gap-2">
              <ArrowRight className="h-5 w-5" />
              ابدأ التسوق
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">سلة المشتريات</h1>
            <p className="text-muted-foreground">{items.length} قطع في السلة</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ part, quantity }) => (
              <Card key={part.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Part info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <code className="text-primary bg-primary/10 px-2 py-1 rounded text-sm font-bold">
                          {part.partNumber}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(part.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                      <h3 className="text-lg font-semibold">{part.nameAr}</h3>
                      <p className="text-muted-foreground">{part.brand}</p>
                    </div>

                    {/* Quantity and price */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => updateQuantity(part.id, quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(e) => updateQuantity(part.id, parseInt(e.target.value) || 1)}
                          className="w-16 h-10 text-center"
                          dir="ltr"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => updateQuantity(part.id, quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-muted-foreground">
                          {part.price.toLocaleString('ar-SA')} × {quantity}
                        </p>
                        <p className="text-xl font-bold text-foreground">
                          {(part.price * quantity).toLocaleString('ar-SA')} ر.س
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">ملاحظات (اختياري)</label>
                  <Textarea
                    placeholder="أضف ملاحظات للطلب..."
                    className="min-h-[80px]"
                  />
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>المجموع الفرعي</span>
                    <span>{subtotal.toLocaleString('ar-SA')} ر.س</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>ضريبة القيمة المضافة (15%)</span>
                    <span>{vat.toLocaleString('ar-SA')} ر.س</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>الإجمالي</span>
                    <span className="text-primary">{total.toLocaleString('ar-SA')} ر.س</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg gap-2"
                    onClick={handleSendOrder}
                  >
                    <Send className="h-5 w-5" />
                    إرسال الطلب
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-14 text-lg gap-2"
                    onClick={handleSaveDraft}
                  >
                    <Save className="h-5 w-5" />
                    حفظ كمسودة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
