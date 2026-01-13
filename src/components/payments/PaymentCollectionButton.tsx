import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { PaymentCollectionDialog } from './PaymentCollectionDialog';

interface PaymentCollectionButtonProps {
  customerName?: string;
  customerPhone?: string;
  invoiceNumber?: string;
  amount?: number;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function PaymentCollectionButton({
  customerName,
  customerPhone,
  invoiceNumber,
  amount,
  variant = 'default',
  size = 'default',
  className
}: PaymentCollectionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        onClick={() => setOpen(true)}
        className={className}
      >
        <CreditCard className="h-4 w-4 ml-2" />
        تحصيل دفعة
      </Button>
      
      <PaymentCollectionDialog
        open={open}
        onOpenChange={setOpen}
        customerName={customerName}
        customerPhone={customerPhone}
        invoiceNumber={invoiceNumber}
        defaultAmount={amount}
      />
    </>
  );
}
