// Stock level thresholds (internal - not exposed to customers)
const STOCK_THRESHOLDS = {
  HIGH: 10,      // > 10 = Available
  MEDIUM: 3,     // 3-10 = Limited
  LOW: 1,        // 1-2 = Last Few
  OUT: 0         // 0 = Out of Stock
};

// Large order threshold (requires contact)
const LARGE_ORDER_THRESHOLD = 20;

export type StockLevel = 'available' | 'limited' | 'low' | 'out';

export interface StockIndicator {
  level: StockLevel;
  label: string;
  labelAr: string;
  color: string;
  bgColor: string;
}

export const getStockLevel = (stock: number): StockLevel => {
  if (stock > STOCK_THRESHOLDS.HIGH) return 'available';
  if (stock >= STOCK_THRESHOLDS.MEDIUM) return 'limited';
  if (stock >= STOCK_THRESHOLDS.LOW) return 'low';
  return 'out';
};

export const getStockIndicator = (stock: number): StockIndicator => {
  const level = getStockLevel(stock);
  
  switch (level) {
    case 'available':
      return {
        level,
        label: 'Available',
        labelAr: 'متوفر',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/30'
      };
    case 'limited':
      return {
        level,
        label: 'Limited',
        labelAr: 'كمية محدودة',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
      };
    case 'low':
      return {
        level,
        label: 'Last Few',
        labelAr: 'آخر القطع',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30'
      };
    case 'out':
      return {
        level,
        label: 'Out of Stock',
        labelAr: 'غير متوفر',
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/30'
      };
  }
};

export interface QuantityValidation {
  isValid: boolean;
  message: string;
  messageAr: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export const validateQuantity = (requestedQty: number, availableStock: number): QuantityValidation => {
  // Zero or negative quantity
  if (requestedQty <= 0) {
    return {
      isValid: false,
      message: 'Enter quantity',
      messageAr: 'أدخل الكمية',
      type: 'info'
    };
  }

  // Large order - requires contact
  if (requestedQty > LARGE_ORDER_THRESHOLD) {
    return {
      isValid: true,
      message: 'Contact us for large orders',
      messageAr: 'تواصل معنا للكميات الكبيرة',
      type: 'info'
    };
  }

  // Out of stock
  if (availableStock === 0) {
    return {
      isValid: false,
      message: 'Out of stock',
      messageAr: 'غير متوفر حالياً',
      type: 'error'
    };
  }

  // Requested more than available
  if (requestedQty > availableStock) {
    return {
      isValid: false,
      message: `Max available: ${Math.min(availableStock, LARGE_ORDER_THRESHOLD)}`,
      messageAr: `الحد الأقصى المتاح: ${Math.min(availableStock, LARGE_ORDER_THRESHOLD)}`,
      type: 'warning'
    };
  }

  // Available
  return {
    isValid: true,
    message: 'Available',
    messageAr: 'الكمية متوفرة ✓',
    type: 'success'
  };
};
