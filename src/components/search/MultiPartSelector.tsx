import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Part } from '@/types';
import { mockParts, mockSuppliers } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectedPartItem {
  part: Part;
  quantity: number;
  supplierId: string;
}

interface MultiPartSelectorProps {
  onAddToGrid: (items: SelectedPartItem[]) => void;
  placeholder?: string;
}

// Parse search query for quantity pattern (e.g., "96700-B11004X x5" or "96700-B11004X *5")
const parseSearchWithQuantity = (query: string): { searchTerm: string; quantity: number } => {
  const patterns = [
    /^(.+?)\s*[xX×]\s*(\d+)$/, // x5, X5, ×5
    /^(.+?)\s*\*\s*(\d+)$/,    // *5
    /^(.+?)\s+(\d+)$/,          // space followed by number
  ];

  for (const pattern of patterns) {
    const match = query.trim().match(pattern);
    if (match) {
      return {
        searchTerm: match[1].trim(),
        quantity: Math.max(1, parseInt(match[2]) || 1)
      };
    }
  }

  return { searchTerm: query, quantity: 1 };
};

export const MultiPartSelector: React.FC<MultiPartSelectorProps> = ({
  onAddToGrid,
  placeholder = 'ابحث بالرقم... (مثال: 96700-B11004X x5 ثم Enter)'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse search query
  const { searchTerm, quantity: parsedQuantity } = useMemo(() => 
    parseSearchWithQuantity(searchQuery), [searchQuery]
  );

  // Filter parts
  const filteredParts = useMemo(() => {
    if (!searchTerm.trim()) return mockParts.slice(0, 15);
    
    const query = searchTerm.toLowerCase();
    return mockParts.filter(part =>
      part.partNumber.toLowerCase().includes(query) ||
      part.name.toLowerCase().includes(query) ||
      part.nameAr.includes(searchTerm) ||
      part.brand.toLowerCase().includes(query)
    ).slice(0, 30);
  }, [searchTerm]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredParts.length, searchTerm]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add part to grid
  const addPartToGrid = useCallback((part: Part, qty: number = 1) => {
    const defaultSupplierId = part.supplierPrices?.[0]?.supplierId || mockSuppliers[0]?.id || '';
    onAddToGrid([{
      part,
      quantity: qty,
      supplierId: defaultSupplierId
    }]);
    setSearchQuery('');
    setIsOpen(false);
    setHighlightedIndex(0);
    // Keep focus on input for continuous entry
    setTimeout(() => inputRef.current?.focus(), 10);
  }, [onAddToGrid]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== 'ArrowDown' && e.key !== 'Enter') return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(prev => 
          prev < filteredParts.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredParts.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredParts.length > 0) {
          const selectedPart = filteredParts[highlightedIndex] || filteredParts[0];
          addPartToGrid(selectedPart, parsedQuantity);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(0);
        break;
    }
  }, [isOpen, filteredParts, highlightedIndex, parsedQuantity, addPartToGrid]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pr-11 pl-20 h-12 text-base"
          dir="ltr"
        />
        
        {/* Quantity badge */}
        {parsedQuantity > 1 && searchTerm && (
          <Badge 
            variant="default" 
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground"
          >
            ×{parsedQuantity}
          </Badge>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground mt-1.5 text-right">
        اضغط <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono mx-1">Enter</kbd> لإضافة القطعة • 
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono mx-1">↑↓</kbd> للتنقل
      </p>

      {/* Dropdown Results */}
      {isOpen && filteredParts.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
          <ScrollArea className="max-h-80">
            <div className="p-1">
              {filteredParts.map((part, index) => (
                <div
                  key={part.id}
                  onClick={() => addPartToGrid(part, parsedQuantity)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md cursor-pointer transition-all",
                    index === highlightedIndex 
                      ? "bg-accent text-accent-foreground ring-1 ring-primary/20" 
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Selection indicator for highlighted */}
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                      index === highlightedIndex 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {index === highlightedIndex ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Part info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold" dir="ltr">
                          {part.partNumber}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {part.brand}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {part.nameAr}
                      </p>
                    </div>

                    {/* Price & Stock */}
                    <div className="text-left flex-shrink-0 ml-2">
                      <div className="font-bold text-primary">
                        {part.price.toFixed(2)} <span className="text-xs font-normal">ر.س</span>
                      </div>
                      <div className={cn(
                        "text-xs font-medium",
                        part.stock > 0 ? "text-green-600" : "text-destructive"
                      )}>
                        {part.stock > 0 ? `متوفر: ${part.stock}` : 'غير متوفر'}
                      </div>
                    </div>
                  </div>

                  {/* Quantity indicator */}
                  {parsedQuantity > 1 && (
                    <Badge variant="secondary" className="mr-2 text-xs">
                      ×{parsedQuantity}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Bottom hint */}
          <div className="border-t border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground text-center">
            اختر قطعة واضغط Enter للإضافة السريعة
          </div>
        </div>
      )}

      {/* No results */}
      {isOpen && searchTerm && filteredParts.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-6 text-center text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
          لا توجد نتائج لـ "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default MultiPartSelector;
