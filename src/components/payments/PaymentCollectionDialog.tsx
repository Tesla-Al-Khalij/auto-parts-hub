import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Send, 
  Phone, 
  Receipt, 
  Calculator,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Payment provider configurations
const PAYMENT_PROVIDERS = {
  tabby: {
    id: 'tabby',
    name: 'Tabby',
    nameAr: 'تابي',
    feePercent: 6,
    logo: '💳',
    color: 'bg-emerald-500',
    description: 'قسّمها على 4 دفعات'
  },
  tamara: {
    id: 'tamara',
    name: 'Tamara', 
    nameAr: 'تمارا',
    feePercent: 5,
    logo: '🛒',
    color: 'bg-pink-500',
    description: 'اشترِ الآن وادفع لاحقاً'
  },
  mispay: {
    id: 'mispay',
    name: 'MIS Pay',
    nameAr: 'مس باي',
    feePercent: 4,
    logo: '💰',
    color: 'bg-blue-500',
    description: 'دفع مرن وسهل'
  }
} as const;

type ProviderId = keyof typeof PAYMENT_PROVIDERS;
type FeeHandling = 'customer_pays' | 'merchant_pays';

interface PaymentCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName?: string;
  customerPhone?: string;
  invoiceNumber?: string;
  defaultAmount?: number;
}

export function PaymentCollectionDialog({
  open,
  onOpenChange,
  customerName = '',
  customerPhone = '',
  invoiceNumber = '',
  defaultAmount = 0
}: PaymentCollectionDialogProps) {
  const { toast } = useToast();
  
  const [phone, setPhone] = useState(customerPhone);
  const [amount, setAmount] = useState(defaultAmount > 0 ? defaultAmount.toString() : '');
  const [provider, setProvider] = useState<ProviderId>('tabby');
  const [feeHandling, setFeeHandling] = useState<FeeHandling>('customer_pays');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Calculate fees and amounts
  const calculations = useMemo(() => {
    const invoiceAmount = parseFloat(amount) || 0;
    const providerConfig = PAYMENT_PROVIDERS[provider];
    const feePercent = providerConfig.feePercent;
    const feeAmount = (invoiceAmount * feePercent) / 100;
    
    if (feeHandling === 'customer_pays') {
      // Customer pays fee - add to invoice
      return {
        invoiceAmount,
        feeAmount,
        feePercent,
        totalToPay: invoiceAmount + feeAmount,
        merchantReceives: invoiceAmount,
        customerPays: invoiceAmount + feeAmount
      };
    } else {
      // Merchant pays fee - deduct from amount
      return {
        invoiceAmount,
        feeAmount,
        feePercent,
        totalToPay: invoiceAmount,
        merchantReceives: invoiceAmount - feeAmount,
        customerPays: invoiceAmount
      };
    }
  }, [amount, provider, feeHandling]);

  const handleSendPaymentLink = async () => {
    if (!phone || !amount) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى إدخال رقم الجوال ومبلغ الفاتورة',
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);
    
    // Simulate sending (demo mode)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSending(false);
    setIsSent(true);
    
    toast({
      title: 'تم إرسال رابط الدفع ✅',
      description: `تم إرسال رابط ${PAYMENT_PROVIDERS[provider].nameAr} إلى ${phone}`,
    });

    // Reset after 2 seconds
    setTimeout(() => {
      setIsSent(false);
      onOpenChange(false);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setPhone(customerPhone);
    setAmount(defaultAmount > 0 ? defaultAmount.toString() : '');
    setProvider('tabby');
    setFeeHandling('customer_pays');
    setIsSent(false);
  };

  const isValid = phone.length >= 10 && parseFloat(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-6 w-6 text-primary" />
            تحصيل دفعة من العميل
          </DialogTitle>
          <DialogDescription>
            أرسل رابط دفع للعميل عبر SMS
          </DialogDescription>
        </DialogHeader>

        {isSent ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto animate-pulse" />
            <h3 className="text-xl font-bold text-green-600">تم الإرسال بنجاح!</h3>
            <p className="text-muted-foreground">
              سيصل رابط الدفع للعميل خلال ثوانٍ
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  رقم جوال العميل
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-1">
                  <Receipt className="h-4 w-4" />
                  مبلغ الفاتورة (ريال)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-left"
                  dir="ltr"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Payment Provider Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                اختر بوابة الدفع
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(PAYMENT_PROVIDERS).map((p) => (
                  <Card 
                    key={p.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      provider === p.id 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setProvider(p.id as ProviderId)}
                  >
                    <CardContent className="p-3 text-center space-y-1">
                      <div className="text-2xl">{p.logo}</div>
                      <div className="font-bold text-sm">{p.nameAr}</div>
                      <Badge variant="secondary" className="text-xs">
                        {p.feePercent}% رسوم
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Fee Handling */}
            <div className="space-y-3">
              <Label className="flex items-center gap-1">
                <Calculator className="h-4 w-4" />
                طريقة احتساب الرسوم
              </Label>
              <RadioGroup 
                value={feeHandling} 
                onValueChange={(v) => setFeeHandling(v as FeeHandling)}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="customer_pays"
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                    feeHandling === 'customer_pays' 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="customer_pays" id="customer_pays" />
                  <div>
                    <div className="font-medium">العميل يدفع الرسوم</div>
                    <div className="text-xs text-muted-foreground">
                      تُضاف للفاتورة
                    </div>
                  </div>
                </Label>
                <Label
                  htmlFor="merchant_pays"
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                    feeHandling === 'merchant_pays' 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value="merchant_pays" id="merchant_pays" />
                  <div>
                    <div className="font-medium">التاجر يتحمل الرسوم</div>
                    <div className="text-xs text-muted-foreground">
                      تُخصم من المبلغ
                    </div>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* Calculations Summary */}
            {parseFloat(amount) > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">مبلغ الفاتورة</span>
                    <span className="font-mono">{calculations.invoiceAmount.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      رسوم {PAYMENT_PROVIDERS[provider].nameAr} ({calculations.feePercent}%)
                    </span>
                    <span className={`font-mono ${feeHandling === 'customer_pays' ? 'text-orange-600' : 'text-red-600'}`}>
                      {feeHandling === 'customer_pays' ? '+' : '-'}{calculations.feeAmount.toFixed(2)} ر.س
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>العميل يدفع</span>
                    <span className="text-primary font-mono">
                      {calculations.customerPays.toFixed(2)} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">يصلك</span>
                    <span className="font-mono text-green-600">
                      {calculations.merchantReceives.toFixed(2)} ر.س
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SMS Preview */}
            {isValid && (
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="text-sm space-y-1">
                      <div className="font-medium text-blue-600">معاينة الرسالة:</div>
                      <div className="text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        مرحباً {customerName || 'عميلنا الكريم'}،
                        <br />
                        لإتمام الدفع بمبلغ {calculations.customerPays.toFixed(2)} ر.س
                        <br />
                        عبر {PAYMENT_PROVIDERS[provider].nameAr}، اضغط على الرابط:
                        <br />
                        <span className="text-blue-500 underline">pay.example.com/xxxxx</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Demo Notice */}
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>وضع تجريبي - لن يتم إرسال رسالة فعلية</span>
            </div>
          </div>
        )}

        {!isSent && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleSendPaymentLink}
              disabled={!isValid || isSending}
              className="gap-2"
            >
              {isSending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  إرسال رابط الدفع
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
