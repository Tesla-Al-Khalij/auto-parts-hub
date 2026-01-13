import React from 'react';
import { cn } from '@/lib/utils';
import { getStockIndicator } from '@/utils/stockUtils';
import { Circle } from 'lucide-react';

interface StockBadgeProps {
  stock: number;
  className?: string;
  showLabel?: boolean;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ 
  stock, 
  className,
  showLabel = true 
}) => {
  const indicator = getStockIndicator(stock);
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        indicator.bgColor,
        indicator.color,
        className
      )}
    >
      <Circle className="h-2 w-2 fill-current" />
      {showLabel && <span>{indicator.labelAr}</span>}
    </div>
  );
};

interface QuantityValidationBadgeProps {
  validation: {
    isValid: boolean;
    messageAr: string;
    type: 'success' | 'warning' | 'error' | 'info';
  };
  className?: string;
}

export const QuantityValidationBadge: React.FC<QuantityValidationBadgeProps> = ({ 
  validation, 
  className 
}) => {
  const typeStyles = {
    success: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    error: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    info: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
  };
  
  return (
    <div 
      className={cn(
        "text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap",
        typeStyles[validation.type],
        className
      )}
    >
      {validation.messageAr}
    </div>
  );
};
