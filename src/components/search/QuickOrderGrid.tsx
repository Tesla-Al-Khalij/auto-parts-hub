import { useState, useRef, useCallback, useMemo } from 'react';
import { Plus, Trash2, ShoppingCart, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockParts } from '@/data/mockData';
import { Part } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface OrderLine {
  id: string;
  partNumber: string;
  part: Part | null;
  quantity: number;
  suggestions: Part[];
  showSuggestions: boolean;
}

const createEmptyLine = (): OrderLine => ({
  id: crypto.randomUUID(),
  partNumber: '',
  part: null,
  quantity: 1,
  suggestions: [],
  showSuggestions: false,
});

export function QuickOrderGrid() {
  const [lines, setLines] = useState<OrderLine[]>(() => 
    Array.from({ length: 10 }, () => createEmptyLine())
  );
  const { addItem } = useCart();
  const { toast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePartNumberChange = useCallback((index: number, value: string) => {
    setLines(prev => {
      const newLines = [...prev];
      const searchValue = value.toLowerCase();
      
      // Search for matching parts
      const suggestions = value.length >= 2 
        ? mockParts.filter(p => 
            p.partNumber.toLowerCase().includes(searchValue) ||
            p.name.toLowerCase().includes(searchValue) ||
            p.nameAr.includes(value)
          ).slice(0, 5)
        : [];

      // Check for exact match
      const exactMatch = mockParts.find(p => 
        p.partNumber.toLowerCase() === searchValue
      );

      newLines[index] = {
        ...newLines[index],
        partNumber: value,
        part: exactMatch || null,
        suggestions,
        showSuggestions: suggestions.length > 0 && !exactMatch,
      };

      return newLines;
    });
  }, []);

  const handleSelectPart = useCallback((index: number, part: Part) => {
    setLines(prev => {
      const newLines = [...prev];
      newLines[index] = {
        ...newLines[index],
        partNumber: part.partNumber,
        part,
        suggestions: [],
        showSuggestions: false,
      };
      return newLines;
    });

    // Focus quantity input
    setTimeout(() => {
      const qtyInput = document.getElementById(`qty-${index}`);
      qtyInput?.focus();
    }, 50);
  }, []);

  const handleQuantityChange = useCallback((index: number, value: string) => {
    const qty = parseInt(value) || 0;
    setLines(prev => {
      const newLines = [...prev];
      newLines[index] = { ...newLines[index], quantity: Math.max(0, qty) };
      return newLines;
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number, field: 'partNumber' | 'quantity') => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (field === 'quantity') {
        e.preventDefault();
        // Move to next line's part number
        const nextIndex = index + 1;
        if (nextIndex < lines.length) {
          inputRefs.current[nextIndex]?.focus();
        } else {
          // Add more lines if at the end
          setLines(prev => [...prev, ...Array.from({ length: 5 }, () => createEmptyLine())]);
          setTimeout(() => {
            inputRefs.current[nextIndex]?.focus();
          }, 50);
        }
      }
    }
    
    // Arrow keys for suggestions
    if (field === 'partNumber' && lines[index].showSuggestions) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        // Simple: just select first suggestion on any arrow
        const firstSuggestion = lines[index].suggestions[0];
        if (firstSuggestion) {
          handleSelectPart(index, firstSuggestion);
        }
      }
    }
  }, [lines, handleSelectPart]);

  const handleClearLine = useCallback((index: number) => {
    setLines(prev => {
      const newLines = [...prev];
      newLines[index] = createEmptyLine();
      return newLines;
    });
  }, []);

  const handleAddMoreLines = () => {
    setLines(prev => [...prev, ...Array.from({ length: 5 }, () => createEmptyLine())]);
  };

  const validLines = useMemo(() => 
    lines.filter(line => line.part && line.quantity > 0),
    [lines]
  );

  const totalAmount = useMemo(() => 
    validLines.reduce((sum, line) => sum + (line.part!.price * line.quantity), 0),
    [validLines]
  );

  const handleAddAllToCart = () => {
    if (validLines.length === 0) {
      toast({
        title: 'لا توجد قطع',
        description: 'الرجاء إضافة قطع للسلة أولاً',
        variant: 'destructive',
      });
      return;
    }

    validLines.forEach(line => {
      addItem(line.part!, line.quantity);
    });

    toast({
      title: 'تمت الإضافة للسلة',
      description: `تم إضافة ${validLines.length} قطعة للسلة`,
    });

    // Clear all lines
    setLines(Array.from({ length: 10 }, () => createEmptyLine()));
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Grid Header */}
      <div className="grid grid-cols-[40px_1fr_200px_100px_120px_100px_50px] gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-t-lg font-medium text-sm">
        <div className="text-center">#</div>
        <div>رقم القطعة</div>
        <div>اسم القطعة</div>
        <div className="text-center">الكمية</div>
        <div className="text-center">السعر</div>
        <div className="text-center">المجموع</div>
        <div></div>
      </div>

      {/* Grid Rows */}
      <div className="border border-border rounded-b-lg overflow-hidden divide-y divide-border">
        {lines.map((line, index) => (
          <div
            key={line.id}
            className={cn(
              "grid grid-cols-[40px_1fr_200px_100px_120px_100px_50px] gap-2 px-3 py-2 items-center",
              index % 2 === 0 ? "bg-background" : "bg-muted/30",
              line.part && "bg-primary/5"
            )}
          >
            {/* Row number */}
            <div className="text-center text-muted-foreground font-medium">
              {index + 1}
            </div>

            {/* Part number with autocomplete */}
            <div className="relative">
              <Input
                ref={el => inputRefs.current[index] = el}
                value={line.partNumber}
                onChange={e => handlePartNumberChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(e, index, 'partNumber')}
                onBlur={() => {
                  setTimeout(() => {
                    setLines(prev => {
                      const newLines = [...prev];
                      newLines[index] = { ...newLines[index], showSuggestions: false };
                      return newLines;
                    });
                  }, 200);
                }}
                placeholder="ادخل رقم القطعة..."
                className="h-9 text-sm font-mono"
                dir="ltr"
              />
              
              {/* Suggestions dropdown */}
              {line.showSuggestions && (
                <div className="absolute top-full right-0 left-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                  {line.suggestions.map(part => (
                    <button
                      key={part.id}
                      type="button"
                      className="w-full px-3 py-2 text-right hover:bg-accent flex items-center justify-between gap-2"
                      onMouseDown={() => handleSelectPart(index, part)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-primary">{part.partNumber}</div>
                        <div className="text-xs text-muted-foreground truncate">{part.nameAr}</div>
                      </div>
                      <div className="text-sm font-medium">{part.price.toFixed(2)} ر.س</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Part name */}
            <div className="text-sm truncate">
              {line.part ? (
                <span className="text-foreground">{line.part.nameAr}</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>

            {/* Quantity */}
            <Input
              id={`qty-${index}`}
              type="number"
              min="1"
              value={line.quantity || ''}
              onChange={e => handleQuantityChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(e, index, 'quantity')}
              disabled={!line.part}
              className="h-9 text-sm text-center"
            />

            {/* Price */}
            <div className="text-center text-sm">
              {line.part ? (
                <span>{line.part.price.toFixed(2)} ر.س</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>

            {/* Total */}
            <div className="text-center text-sm font-medium">
              {line.part && line.quantity > 0 ? (
                <span className="text-primary">{(line.part.price * line.quantity).toFixed(2)}</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>

            {/* Clear button */}
            <div className="text-center">
              {(line.partNumber || line.part) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleClearLine(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add more rows */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddMoreLines}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        إضافة صفوف
      </Button>

      {/* Summary & Add to Cart */}
      {validLines.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-5 w-5" />
              <span><strong className="text-foreground">{validLines.length}</strong> قطعة</span>
            </div>
            <div className="text-lg font-bold text-primary">
              المجموع: {totalAmount.toFixed(2)} ر.س
            </div>
          </div>
          
          <Button size="lg" onClick={handleAddAllToCart} className="gap-2">
            <ShoppingCart className="h-5 w-5" />
            إضافة الكل للسلة
          </Button>
        </div>
      )}
    </div>
  );
}
