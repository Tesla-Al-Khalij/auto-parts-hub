import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Part } from '@/types';
import { mockParts, mockSuppliers } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Minus, X, Check, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectedPart {
  part: Part;
  quantity: number;
  supplierId: string;
}

interface MultiPartSelectorProps {
  onAddToGrid: (items: SelectedPart[]) => void;
  placeholder?: string;
}

// Parse search query for quantity pattern (e.g., "96700-B11004X x5" or "96700-B11004X *5" or "96700-B11004X 5")
const parseSearchWithQuantity = (query: string): { searchTerm: string; quantity: number } => {
  // Match patterns like: "partNumber x5", "partNumber *5", "partNumber X5", "partNumber 5"
  const patterns = [
    /^(.+?)\s*[xX×]\s*(\d+)$/, // x5, X5, ×5
    /^(.+?)\s*\*\s*(\d+)$/,    // *5
    /^(.+?)\s+(\d+)$/,          // space followed by number at end
  ];

  for (const pattern of patterns) {
    const match = query.trim().match(pattern);
    if (match) {
      return {
        searchTerm: match[1].trim(),
        quantity: parseInt(match[2]) || 1
      };
    }
  }

  return { searchTerm: query, quantity: 1 };
};

export const MultiPartSelector: React.FC<MultiPartSelectorProps> = ({
  onAddToGrid,
  placeholder = 'ابحث بالرقم أو الاسم... (مثال: 96700-B11004X x5)'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedParts, setSelectedParts] = useState<Map<string, SelectedPart>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse search query for quantity
  const { searchTerm, quantity: parsedQuantity } = useMemo(() => 
    parseSearchWithQuantity(searchQuery), [searchQuery]
  );

  // Filter parts based on search term (without quantity)
  const filteredParts = useMemo(() => {
    if (!searchTerm.trim()) return mockParts.slice(0, 20);
    
    const query = searchTerm.toLowerCase();
    return mockParts.filter(part =>
      part.partNumber.toLowerCase().includes(query) ||
      part.name.toLowerCase().includes(query) ||
      part.nameAr.includes(searchTerm) ||
      part.brand.toLowerCase().includes(query)
    ).slice(0, 50);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTogglePart = (part: Part, customQuantity?: number) => {
    setSelectedParts(prev => {
      const newMap = new Map(prev);
      if (newMap.has(part.id) && !customQuantity) {
        newMap.delete(part.id);
      } else {
        // Default supplier
        const defaultSupplierId = part.supplierPrices?.[0]?.supplierId || mockSuppliers[0]?.id || '';
        const qty = customQuantity || parsedQuantity || 1;
        newMap.set(part.id, {
          part,
          quantity: qty,
          supplierId: defaultSupplierId
        });
      }
      return newMap;
    });
  };

  // Quick add with Enter key when there's exactly one result
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredParts.length === 1) {
      e.preventDefault();
      const part = filteredParts[0];
      handleTogglePart(part, parsedQuantity);
      
      // If part was just added, also add to grid immediately
      if (!selectedParts.has(part.id)) {
        const defaultSupplierId = part.supplierPrices?.[0]?.supplierId || mockSuppliers[0]?.id || '';
        onAddToGrid([{
          part,
          quantity: parsedQuantity,
          supplierId: defaultSupplierId
        }]);
        setSearchQuery('');
      }
    }
  };

  const handleQuantityChange = (partId: string, delta: number) => {
    setSelectedParts(prev => {
      const newMap = new Map(prev);
      const item = newMap.get(partId);
      if (item) {
        const newQuantity = Math.max(1, item.quantity + delta);
        newMap.set(partId, { ...item, quantity: newQuantity });
      }
      return newMap;
    });
  };

  const handleDirectQuantityChange = (partId: string, value: string) => {
    const quantity = parseInt(value) || 1;
    setSelectedParts(prev => {
      const newMap = new Map(prev);
      const item = newMap.get(partId);
      if (item) {
        newMap.set(partId, { ...item, quantity: Math.max(1, quantity) });
      }
      return newMap;
    });
  };

  const handleAddAllToGrid = () => {
    if (selectedParts.size === 0) return;
    
    const items = Array.from(selectedParts.values());
    onAddToGrid(items);
    setSelectedParts(new Map());
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleRemoveSelected = (partId: string) => {
    setSelectedParts(prev => {
      const newMap = new Map(prev);
      newMap.delete(partId);
      return newMap;
    });
  };

  const getPartPrice = (part: Part, supplierId: string) => {
    const supplierPrice = part.supplierPrices?.find(sp => sp.supplierId === supplierId);
    return supplierPrice?.price || part.price;
  };

  const getPartStock = (part: Part, supplierId: string) => {
    const supplierPrice = part.supplierPrices?.find(sp => sp.supplierId === supplierId);
    return supplierPrice?.stock ?? part.stock;
  };

  const totalSelectedCount = selectedParts.size;
  const totalQuantity = Array.from(selectedParts.values()).reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = Array.from(selectedParts.values()).reduce((sum, item) => {
    const price = getPartPrice(item.part, item.supplierId);
    return sum + (price * item.quantity);
  }, 0);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pr-10 pl-4"
        />
        {/* Show parsed quantity indicator */}
        {parsedQuantity > 1 && searchTerm && (
          <Badge 
            variant="secondary" 
            className="absolute left-24 top-1/2 -translate-y-1/2"
          >
            الكمية: {parsedQuantity}
          </Badge>
        )}
        {totalSelectedCount > 0 && (
          <Badge 
            variant="default" 
            className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            {totalSelectedCount} قطعة
          </Badge>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col max-h-[500px]">
            {/* Selected Items Summary */}
            {selectedParts.size > 0 && (
              <div className="border-b border-border bg-muted/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    القطع المختارة ({totalSelectedCount})
                  </span>
                  <Button
                    size="sm"
                    onClick={handleAddAllToGrid}
                    className="gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    إضافة الكل للطلب
                  </Button>
                </div>
                
                {/* Selected items list */}
                <ScrollArea className="max-h-32">
                  <div className="space-y-2">
                    {Array.from(selectedParts.values()).map(({ part, quantity, supplierId }) => (
                      <div 
                        key={part.id} 
                        className="flex items-center gap-2 bg-background rounded-md p-2 text-sm"
                      >
                        <button
                          onClick={() => handleRemoveSelected(part.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <span className="flex-1 truncate text-foreground">{part.partNumber}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(part.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => handleDirectQuantityChange(part.id, e.target.value)}
                            className="w-14 h-6 text-center p-1 min-h-0"
                            min={1}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(part.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-muted-foreground w-20 text-left">
                          {(getPartPrice(part, supplierId) * quantity).toFixed(2)} ر.س
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Total */}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border text-sm">
                  <span className="text-muted-foreground">الإجمالي: {totalQuantity} قطعة</span>
                  <span className="font-semibold text-foreground">{totalAmount.toFixed(2)} ر.س</span>
                </div>
              </div>
            )}

            {/* Search Results */}
            <ScrollArea className="flex-1 max-h-80">
              <div className="p-2">
                {filteredParts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد نتائج للبحث
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredParts.map((part) => {
                      const isSelected = selectedParts.has(part.id);
                      const selectedItem = selectedParts.get(part.id);
                      const stock = getPartStock(part, selectedItem?.supplierId || '');
                      
                      return (
                        <div
                          key={part.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                            isSelected 
                              ? "bg-primary/10 border border-primary/30" 
                              : "hover:bg-accent border border-transparent"
                          )}
                          onClick={() => handleTogglePart(part)}
                        >
                          {/* Selection Indicator */}
                          <div className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                            isSelected 
                              ? "bg-primary border-primary" 
                              : "border-muted-foreground/30"
                          )}>
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>

                          {/* Part Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium text-foreground">
                                {part.partNumber}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {part.brand}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {part.nameAr}
                            </p>
                          </div>

                          {/* Stock & Price */}
                          <div className="text-left flex-shrink-0">
                            <div className="font-semibold text-foreground">
                              {part.price.toFixed(2)} ر.س
                            </div>
                            <div className={cn(
                              "text-xs",
                              stock > 0 ? "text-success" : "text-destructive"
                            )}>
                              {stock > 0 ? `متوفر: ${stock}` : 'غير متوفر'}
                            </div>
                          </div>

                          {/* Quick Quantity Adjustment (when selected) */}
                          {isSelected && selectedItem && (
                            <div 
                              className="flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleQuantityChange(part.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={selectedItem.quantity}
                                onChange={(e) => handleDirectQuantityChange(part.id, e.target.value)}
                                className="w-14 h-7 text-center p-1 min-h-0"
                                min={1}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleQuantityChange(part.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiPartSelector;
