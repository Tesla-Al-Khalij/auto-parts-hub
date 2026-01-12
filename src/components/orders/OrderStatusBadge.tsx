import { OrderStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: {
    label: 'قيد الانتظار',
    icon: Clock,
    className: 'status-pending',
  },
  confirmed: {
    label: 'تم التأكيد',
    icon: CheckCircle,
    className: 'status-confirmed',
  },
  shipped: {
    label: 'تم الشحن',
    icon: Truck,
    className: 'status-shipped',
  },
  delivered: {
    label: 'تم التسليم',
    icon: Package,
    className: 'status-delivered',
  },
  cancelled: {
    label: 'ملغي',
    icon: XCircle,
    className: 'status-cancelled',
  },
};

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center font-medium border',
        config.className,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </Badge>
  );
}
