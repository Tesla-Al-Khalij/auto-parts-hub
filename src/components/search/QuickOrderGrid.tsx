import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Plus, Trash2, Package, Keyboard, Copy, Save, Send, FileText, FileSpreadsheet, Eye, ChevronDown, ChevronUp, AlertCircle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockSuppliers, mockOrders, mockParts } from '@/data/mockData';
import { useCachedParts } from '@/hooks/useCachedParts';
import { Part, Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ExcelImportDialog } from './ExcelImportDialog';
import { OrderDetailsDialog } from '@/components/orders/OrderDetailsDialog';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { useDraftOrder } from '@/contexts/DraftOrderContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderLine {
  id: string;
  partNumber: string;
  part: Part | null;
  quantity: number;
  suggestions: Part[];
  showSuggestions: boolean;
  highlightedIndex: number;
  selectedSupplierId: string | null;
  selectedPrice: number;
}

const createEmptyLine = (): OrderLine => ({
  id: crypto.randomUUID(),
  partNumber: '',
  part: null,
  quantity: 1,
  suggestions: [],
  showSuggestions: false,
  highlightedIndex: -1,
  selectedSupplierId: null,
  selectedPrice: 0,
});

// Helper to get supplier name
const getSupplierName = (supplierId: string) => {
  const supplier = mockSuppliers.find(s => s.id === supplierId);
  return supplier?.nameAr || supplier?.name || supplierId;
};

export function QuickOrderGrid() {
  const { parts } = useCachedParts();
  const { draftOrder, clearDraftOrder } = useDraftOrder();
  const [lines, setLines] = useState<OrderLine[]>(() => 
    Array.from({ length: 10 }, () => createEmptyLine())
  );
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [excelDialogOpen, setExcelDialogOpen] = useState(false);
  const [showRecentOrders, setShowRecentOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const { toast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load draft order when it changes
  useEffect(() => {
    if (draftOrder && draftOrder.isDraft) {
      // Convert order items to lines
      const draftLines: OrderLine[] = draftOrder.items.map(item => {
        // Find the part in our parts list
        const part = mockParts.find(p => p.partNumber === item.partNumber) || null;
        const firstSupplier = part?.supplierPrices?.[0];
        
        return {
          id: crypto.randomUUID(),
          partNumber: item.partNumber,
          part,
          quantity: item.quantity,
          suggestions: [],
          showSuggestions: false,
          highlightedIndex: -1,
          selectedSupplierId: firstSupplier?.supplierId || null,
          selectedPrice: item.unitPrice || firstSupplier?.price || 0,
        };
      });

      // Add empty lines to fill up to 10
      while (draftLines.length < 10) {
        draftLines.push(createEmptyLine());
      }

      setLines(draftLines);
      setCustomerNotes(draftOrder.notes || '');
      setEditingDraftId(draftOrder.id);
      
      toast({
        title: 'تم تحميل المسودة',
        description: `جاري تعديل الطلب ${draftOrder.orderNumber}`,
      });

      // Clear the draft from context so it doesn't reload
      clearDraftOrder();
    }
  }, [draftOrder, clearDraftOrder, toast]);

  const handleCancelEdit = () => {
    setEditingDraftId(null);
    setLines(Array.from({ length: 10 }, () => createEmptyLine()));
    setCustomerNotes('');
    toast({
      title: 'تم إلغاء التعديل',
    });
  };

  // Add new row at specific position
  const handleAddRowAt = useCallback((index: number) => {
    setLines(prev => {
      const newLines = [...prev];
      newLines.splice(index + 1, 0, createEmptyLine());
      return newLines;
    });
    setTimeout(() => {
      inputRefs.current[index + 1]?.focus();
    }, 50);
    toast({
      title: 'تم إضافة صف جديد',
      description: `تم إضافة صف في الموضع ${index + 2}`,
    });
  }, [toast]);

  // Remove row at specific position
  const handleRemoveRowAt = useCallback((index: number) => {
    setLines(prev => {
      if (prev.length <= 1) {
        // Keep at least one row
        return [createEmptyLine()];
      }
      const newLines = [...prev];
      newLines.splice(index, 1);
      return newLines;
    });
    // Focus previous or current row
    setTimeout(() => {
      const newIndex = Math.max(0, index - 1);
      inputRefs.current[newIndex]?.focus();
    }, 50);
    toast({
      title: 'تم حذف الصف',
    });
  }, [toast]);

  // Duplicate current row
  const handleDuplicateRow = useCallback((index: number) => {
    setLines(prev => {
      const newLines = [...prev];
      const duplicatedLine = { ...newLines[index], id: crypto.randomUUID() };
      newLines.splice(index + 1, 0, duplicatedLine);
      return newLines;
    });
    setTimeout(() => {
      inputRefs.current[index + 1]?.focus();
    }, 50);
    toast({
      title: 'تم نسخ الصف',
    });
  }, [toast]);

  // Clear all rows
  const handleClearAll = useCallback(() => {
    setLines(Array.from({ length: 10 }, () => createEmptyLine()));
    setCustomerNotes('');
    inputRefs.current[0]?.focus();
    toast({
      title: 'تم مسح الكل',
    });
  }, [toast]);

  // Handle Excel import - add items from dialog
  const handleExcelImport = useCallback((items: { part: Part; quantity: number }[]) => {
    const importedLines: OrderLine[] = items.map(item => {
      const firstSupplier = item.part.supplierPrices?.[0];
      return {
        id: crypto.randomUUID(),
        partNumber: item.part.partNumber,
        part: item.part,
        quantity: item.quantity,
        suggestions: [],
        showSuggestions: false,
        highlightedIndex: -1,
        selectedSupplierId: firstSupplier?.supplierId || null,
        selectedPrice: firstSupplier?.price || item.part.price,
      };
    });

    setLines(prev => {
      // Replace empty lines or add to end
      const nonEmptyLines = prev.filter(l => l.partNumber || l.part);
      const newLines = [...nonEmptyLines, ...importedLines];
      // Ensure minimum rows
      while (newLines.length < 10) {
        newLines.push(createEmptyLine());
      }
      return newLines;
    });

    toast({
      title: 'تم استيراد الملف',
      description: `تم إضافة ${items.length} قطعة للطلب`,
    });
  }, [toast]);

  // Ref to hold handleSaveOrder for useEffect
  const handleSaveOrderRef = useRef<() => void>(() => {});

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // F11 - Add new row after focused
      if (e.key === 'F11') {
        e.preventDefault();
        handleAddRowAt(focusedIndex);
        return;
      }
      
      // F12 - Remove current row
      if (e.key === 'F12') {
        e.preventDefault();
        handleRemoveRowAt(focusedIndex);
        return;
      }
      
      // Ctrl+D - Duplicate current row
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        handleDuplicateRow(focusedIndex);
        return;
      }
      
      // Ctrl+Enter - Save order directly
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleSaveOrderRef.current();
        return;
      }
      
      // Ctrl+Shift+Delete - Clear all
      if (e.ctrlKey && e.shiftKey && e.key === 'Delete') {
        e.preventDefault();
        handleClearAll();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [focusedIndex, handleAddRowAt, handleRemoveRowAt, handleDuplicateRow, handleClearAll]);

  const handlePartNumberChange = useCallback((index: number, value: string) => {
    setLines(prev => {
      const newLines = [...prev];
      const searchValue = value.toLowerCase();
      
      // Search for matching parts
      const suggestions = value.length >= 2 
        ? parts.filter(p => 
            p.partNumber.toLowerCase().includes(searchValue) ||
            p.name.toLowerCase().includes(searchValue) ||
            p.nameAr.includes(value)
          ).slice(0, 5)
        : [];

      // Check for exact match
      const exactMatch = parts.find(p => 
        p.partNumber.toLowerCase() === searchValue
      );

      // Auto-select first supplier if part found
      let selectedSupplierId = newLines[index].selectedSupplierId;
      let selectedPrice = newLines[index].selectedPrice;
      
      if (exactMatch) {
        const firstSupplier = exactMatch.supplierPrices?.[0];
        if (firstSupplier) {
          selectedSupplierId = firstSupplier.supplierId;
          selectedPrice = firstSupplier.price;
        } else {
          selectedSupplierId = null;
          selectedPrice = exactMatch.price;
        }
      }

      newLines[index] = {
        ...newLines[index],
        partNumber: value,
        part: exactMatch || null,
        suggestions,
        showSuggestions: suggestions.length > 0 && !exactMatch,
        highlightedIndex: -1,
        selectedSupplierId,
        selectedPrice,
      };

      return newLines;
    });
  }, [parts]);

  const handleSelectPart = useCallback((index: number, part: Part) => {
    // Auto-select first supplier
    const firstSupplier = part.supplierPrices?.[0];
    
    setLines(prev => {
      const newLines = [...prev];
      newLines[index] = {
        ...newLines[index],
        partNumber: part.partNumber,
        part,
        suggestions: [],
        showSuggestions: false,
        selectedSupplierId: firstSupplier?.supplierId || null,
        selectedPrice: firstSupplier?.price || part.price,
      };
      return newLines;
    });

    // Focus quantity input
    setTimeout(() => {
      const qtyInput = document.getElementById(`qty-${index}`);
      qtyInput?.focus();
    }, 50);
  }, []);

  const handleSupplierChange = useCallback((index: number, supplierId: string) => {
    setLines(prev => {
      const newLines = [...prev];
      const part = newLines[index].part;
      const supplierPrice = part?.supplierPrices?.find(sp => sp.supplierId === supplierId);
      
      newLines[index] = {
        ...newLines[index],
        selectedSupplierId: supplierId,
        selectedPrice: supplierPrice?.price || part?.price || 0,
      };
      return newLines;
    });
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
    const line = lines[index];
    
    // Handle suggestions navigation
    if (field === 'partNumber' && line.showSuggestions && line.suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setLines(prev => {
          const newLines = [...prev];
          const currentIdx = newLines[index].highlightedIndex;
          const nextIdx = currentIdx < newLines[index].suggestions.length - 1 ? currentIdx + 1 : 0;
          newLines[index] = { ...newLines[index], highlightedIndex: nextIdx };
          return newLines;
        });
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setLines(prev => {
          const newLines = [...prev];
          const currentIdx = newLines[index].highlightedIndex;
          const nextIdx = currentIdx > 0 ? currentIdx - 1 : newLines[index].suggestions.length - 1;
          newLines[index] = { ...newLines[index], highlightedIndex: nextIdx };
          return newLines;
        });
        return;
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        const selectedIndex = line.highlightedIndex >= 0 ? line.highlightedIndex : 0;
        const selectedPart = line.suggestions[selectedIndex];
        if (selectedPart) {
          handleSelectPart(index, selectedPart);
        }
        return;
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setLines(prev => {
          const newLines = [...prev];
          newLines[index] = { ...newLines[index], showSuggestions: false, highlightedIndex: -1 };
          return newLines;
        });
        return;
      }
    }
    
    // Move to next row on Enter/Tab from quantity
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (field === 'quantity') {
        e.preventDefault();
        const nextIndex = index + 1;
        if (nextIndex < lines.length) {
          inputRefs.current[nextIndex]?.focus();
        } else {
          setLines(prev => [...prev, ...Array.from({ length: 5 }, () => createEmptyLine())]);
          setTimeout(() => {
            inputRefs.current[nextIndex]?.focus();
          }, 50);
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

  // Group by supplier for summary
  const supplierGroups = useMemo(() => {
    const groups: Record<string, { supplierName: string; lines: typeof validLines; total: number }> = {};
    
    validLines.forEach(line => {
      const supplierId = line.selectedSupplierId || 'default';
      const supplierName = line.selectedSupplierId ? getSupplierName(line.selectedSupplierId) : 'غير محدد';
      
      if (!groups[supplierId]) {
        groups[supplierId] = { supplierName, lines: [], total: 0 };
      }
      groups[supplierId].lines.push(line);
      groups[supplierId].total += line.selectedPrice * line.quantity;
    });
    
    return groups;
  }, [validLines]);

  const totalAmount = useMemo(() => 
    validLines.reduce((sum, line) => sum + (line.selectedPrice * line.quantity), 0),
    [validLines]
  );

  // Save order as draft (grouped by supplier)
  const handleSaveAsDraft = useCallback(() => {
    if (validLines.length === 0) {
      toast({
        title: 'لا توجد قطع',
        description: 'الرجاء إضافة قطع أولاً',
        variant: 'destructive',
      });
      return;
    }

    // Create separate draft orders for each supplier
    Object.entries(supplierGroups).forEach(([supplierId, group]) => {
      const orderNumber = `DRAFT-${Date.now()}-${supplierId.slice(-3).toUpperCase()}`;
      
      console.log('Draft order saved:', {
        orderNumber,
        supplierId,
        supplierName: group.supplierName,
        customerNotes,
        isDraft: true,
        items: group.lines.map(line => ({
          partId: line.part!.id,
          partNumber: line.part!.partNumber,
          name: line.part!.nameAr,
          quantity: line.quantity,
          unitPrice: line.selectedPrice,
          total: line.selectedPrice * line.quantity,
        })),
        total: group.total,
      });
    });

    const supplierCount = Object.keys(supplierGroups).length;
    toast({
      title: 'تم حفظ المسودة',
      description: `تم حفظ ${supplierCount} طلب${supplierCount > 1 ? 'ات' : ''} كمسودة`,
    });

    // Clear all lines
    setLines(Array.from({ length: 10 }, () => createEmptyLine()));
    setCustomerNotes('');
  }, [validLines, supplierGroups, customerNotes, toast]);

  // Send order directly (grouped by supplier)
  const handleSendOrder = useCallback(() => {
    if (validLines.length === 0) {
      toast({
        title: 'لا توجد قطع',
        description: 'الرجاء إضافة قطع أولاً',
        variant: 'destructive',
      });
      return;
    }

    // Create and send separate orders for each supplier
    Object.entries(supplierGroups).forEach(([supplierId, group]) => {
      const orderNumber = `ORD-${Date.now()}-${supplierId.slice(-3).toUpperCase()}`;
      
      console.log('Order sent:', {
        orderNumber,
        supplierId,
        supplierName: group.supplierName,
        customerNotes,
        isDraft: false,
        status: 'pending',
        items: group.lines.map(line => ({
          partId: line.part!.id,
          partNumber: line.part!.partNumber,
          name: line.part!.nameAr,
          quantity: line.quantity,
          unitPrice: line.selectedPrice,
          total: line.selectedPrice * line.quantity,
        })),
        total: group.total,
      });
    });

    const supplierCount = Object.keys(supplierGroups).length;
    toast({
      title: 'تم إرسال الطلب بنجاح',
      description: `تم إرسال ${supplierCount} طلب${supplierCount > 1 ? 'ات' : ''} للموردين`,
    });

    // Clear all lines
    setLines(Array.from({ length: 10 }, () => createEmptyLine()));
    setCustomerNotes('');
  }, [validLines, supplierGroups, customerNotes, toast]);

  // Update ref when handleSendOrder changes
  useEffect(() => {
    handleSaveOrderRef.current = handleSendOrder;
  }, [handleSendOrder]);

  // Get recent orders (last 5)
  const recentOrders = useMemo(() => 
    [...mockOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    []
  );

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  return (
    <div className="space-y-4" dir="rtl" ref={containerRef}>
      {/* Order Details Dialog */}
      <OrderDetailsDialog 
        order={selectedOrder} 
        open={orderDetailsOpen} 
        onOpenChange={setOrderDetailsOpen} 
      />

      {/* Excel Import Dialog */}
      <ExcelImportDialog
        open={excelDialogOpen}
        onOpenChange={setExcelDialogOpen}
        onImport={handleExcelImport}
        parts={parts}
      />

      {/* Editing Draft Alert */}
      {editingDraftId && (
        <Alert className="border-warning bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-warning font-medium">
              أنت تقوم بتعديل مسودة طلب. قم بإجراء التعديلات ثم اضغط إرسال الطلب.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="gap-1 text-warning hover:text-warning hover:bg-warning/20"
            >
              <X className="h-4 w-4" />
              إلغاء التعديل
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Excel Import & Keyboard shortcuts */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Excel import */}
        <Button
          variant="outline"
          onClick={() => setExcelDialogOpen(true)}
          className="gap-2 border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary"
        >
          <FileSpreadsheet className="h-5 w-5" />
          رفع ملف Excel
        </Button>

        {/* Keyboard shortcuts hint */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Keyboard className="h-4 w-4" />
          </div>
          <Badge variant="outline" className="gap-1">
            <span className="font-mono">F11</span>
            <span className="text-muted-foreground">صف جديد</span>
          </Badge>
          <Badge variant="outline" className="gap-1">
            <span className="font-mono">F12</span>
            <span className="text-muted-foreground">حذف صف</span>
          </Badge>
          <Badge variant="outline" className="gap-1">
            <span className="font-mono">Ctrl+D</span>
            <span className="text-muted-foreground">نسخ صف</span>
          </Badge>
          <Badge variant="outline" className="gap-1">
            <span className="font-mono">Ctrl+Enter</span>
            <span className="text-muted-foreground">إرسال</span>
          </Badge>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button 
          onClick={() => setShowRecentOrders(!showRecentOrders)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-medium">الطلبات الأخيرة</span>
            <Badge variant="secondary" className="text-xs">{recentOrders.length}</Badge>
          </div>
          {showRecentOrders ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {showRecentOrders && (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => {
              const formattedDate = new Date(order.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              
              return (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-bold">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{formattedDate}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">{order.items.length} قطعة</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-bold text-primary">{order.total.toLocaleString('en-US')} ر.س</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                      عرض
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-[40px_1fr_180px_150px_80px_100px_80px_60px] gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-t-lg font-medium text-sm">
        <div className="text-center">#</div>
        <div>رقم القطعة</div>
        <div>اسم القطعة</div>
        <div>المورد</div>
        <div className="text-center">الكمية</div>
        <div className="text-center">السعر</div>
        <div className="text-center">المجموع</div>
        <div className="text-center">إجراءات</div>
      </div>

      {/* Grid Rows */}
      <div className="border border-border rounded-b-lg overflow-hidden divide-y divide-border">
        {lines.map((line, index) => (
          <div
            key={line.id}
            className={cn(
              "grid grid-cols-[40px_1fr_180px_150px_80px_100px_80px_60px] gap-2 px-3 py-2 items-center transition-colors",
              index % 2 === 0 ? "bg-background" : "bg-muted/30",
              line.part && "bg-primary/5",
              focusedIndex === index && "ring-1 ring-primary/50 bg-primary/5"
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
                onFocus={() => setFocusedIndex(index)}
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
                className="h-9 text-sm font-mono text-right"
                dir="rtl"
              />
              
              {/* Suggestions dropdown */}
              {line.showSuggestions && (
                <div className="absolute top-full right-0 left-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                  {line.suggestions.map((part, suggestionIndex) => (
                    <button
                      key={part.id}
                      type="button"
                      className={cn(
                        "w-full px-3 py-2 text-right flex items-center justify-between gap-2 transition-colors",
                        suggestionIndex === line.highlightedIndex 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-accent"
                      )}
                      onMouseDown={() => handleSelectPart(index, part)}
                      onMouseEnter={() => {
                        setLines(prev => {
                          const newLines = [...prev];
                          newLines[index] = { ...newLines[index], highlightedIndex: suggestionIndex };
                          return newLines;
                        });
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-mono text-sm",
                          suggestionIndex === line.highlightedIndex ? "text-primary-foreground" : "text-primary"
                        )}>{part.partNumber}</div>
                        <div className={cn(
                          "text-xs truncate",
                          suggestionIndex === line.highlightedIndex ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>{part.nameAr}</div>
                      </div>
                      <div className="text-left">
                        <div className={cn(
                          "text-sm font-medium",
                          suggestionIndex === line.highlightedIndex ? "text-primary-foreground" : ""
                        )}>{part.price.toFixed(2)} ر.س</div>
                        {part.supplierPrices && part.supplierPrices.length > 1 && (
                          <div className={cn(
                            "text-xs",
                            suggestionIndex === line.highlightedIndex ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>{part.supplierPrices.length} موردين</div>
                        )}
                      </div>
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

            {/* Supplier dropdown */}
            <div>
              {line.part && line.part.supplierPrices && line.part.supplierPrices.length > 0 ? (
                <Select
                  value={line.selectedSupplierId || ''}
                  onValueChange={(value) => handleSupplierChange(index, value)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    {line.part.supplierPrices.map((sp) => (
                      <SelectItem key={sp.supplierId} value={sp.supplierId}>
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span>{getSupplierName(sp.supplierId)}</span>
                          <span className="text-primary font-medium">{sp.price.toFixed(2)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>

            {/* Quantity - editable input */}
            <Input
              id={`qty-${index}`}
              type="number"
              min="0"
              value={line.quantity === 0 ? '' : line.quantity}
              onChange={e => handleQuantityChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(e, index, 'quantity')}
              onFocus={() => setFocusedIndex(index)}
              placeholder="0"
              className="h-9 text-sm text-center"
            />

            {/* Price */}
            <div className="text-center text-sm">
              {line.part ? (
                <span>{line.selectedPrice.toFixed(2)} ر.س</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>

            {/* Total */}
            <div className="text-center text-sm font-medium">
              {line.part && line.quantity > 0 ? (
                <span className="text-primary">{(line.selectedPrice * line.quantity).toFixed(2)}</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5">
              {(line.partNumber || line.part) && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={() => handleDuplicateRow(index)}
                    title="نسخ الصف (Ctrl+D)"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleClearLine(index)}
                    title="مسح الصف"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
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

      {/* Summary by Supplier & Add to Cart */}
      {validLines.length > 0 && (
        <div className="space-y-3">
          {/* Customer Notes */}
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <label htmlFor="customer-notes" className="text-sm font-medium">
                ملاحظات العميل
              </label>
            </div>
            <textarea
              id="customer-notes"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="أضف أي ملاحظات أو تعليمات خاصة بالطلب..."
              className="w-full min-h-[80px] p-3 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
              dir="rtl"
            />
          </div>

          {/* Supplier breakdown */}
          <div className="p-4 bg-secondary/30 rounded-lg border border-border space-y-2">
            <div className="text-sm font-medium text-muted-foreground mb-2">تفصيل حسب المورد:</div>
            {Object.entries(supplierGroups).map(([supplierId, group]) => (
              <div key={supplierId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{group.supplierName}</span>
                  <span className="text-muted-foreground">({group.lines.length} قطعة)</span>
                </div>
                <span className="font-bold text-primary">{group.total.toFixed(2)} ر.س</span>
              </div>
            ))}
          </div>

          {/* Total & Order Actions */}
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-5 w-5" />
                <span><strong className="text-foreground">{validLines.length}</strong> قطعة</span>
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">{Object.keys(supplierGroups).length}</strong> مورد</span>
              </div>
              <div className="text-lg font-bold text-primary">
                الإجمالي: {totalAmount.toFixed(2)} ر.س
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleSaveAsDraft} 
                className="gap-2"
              >
                <Save className="h-5 w-5" />
                حفظ كمسودة
              </Button>
              <Button 
                size="lg" 
                onClick={handleSendOrder} 
                className="gap-2"
              >
                <Send className="h-5 w-5" />
                إرسال الطلب
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
