import { ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-react';
import { Transaction, TransactionType } from '@/types';
import { cn } from '@/lib/utils';

interface TransactionRowProps {
  transaction: Transaction;
}

const typeConfig: Record<TransactionType, { label: string; icon: typeof ArrowDownLeft; colorClass: string }> = {
  sale: {
    label: 'مبيعات',
    icon: ArrowDownLeft,
    colorClass: 'text-destructive',
  },
  return: {
    label: 'مرتجع',
    icon: ArrowUpRight,
    colorClass: 'text-success',
  },
  payment: {
    label: 'دفعة',
    icon: CreditCard,
    colorClass: 'text-success',
  },
};

export function TransactionRow({ transaction }: TransactionRowProps) {
  const config = typeConfig[transaction.type];
  const Icon = config.icon;

  const formattedDate = new Date(transaction.date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors rounded-lg">
      {/* Icon */}
      <div className={cn(
        'flex h-12 w-12 items-center justify-center rounded-full',
        transaction.amount > 0 ? 'bg-success/10' : 'bg-destructive/10'
      )}>
        <Icon className={cn('h-6 w-6', config.colorClass)} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{transaction.description}</span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            transaction.type === 'sale' && 'bg-destructive/10 text-destructive',
            transaction.type === 'return' && 'bg-success/10 text-success',
            transaction.type === 'payment' && 'bg-primary/10 text-primary',
          )}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{transaction.reference}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-left">
        <p className={cn(
          'text-lg font-bold',
          transaction.amount > 0 ? 'text-success' : 'text-destructive'
        )}>
          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('ar-SA')} ر.س
        </p>
        <p className="text-sm text-muted-foreground">
          الرصيد: {transaction.balance.toLocaleString('ar-SA')} ر.س
        </p>
      </div>
    </div>
  );
}
