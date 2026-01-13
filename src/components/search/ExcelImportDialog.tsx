import { useState, useCallback, useMemo } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Part } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExcelRow {
  data: string[];
}

interface ProcessedItem {
  originalPartNumber: string;
  quantity: number;
  matchedPart: Part | null;
  alternatives: Part[];
  selectedPart: Part | null;
}

interface ExcelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: { part: Part; quantity: number }[]) => void;
  parts: Part[];
}

type ImportStep = 'upload' | 'columns' | 'match' | 'review';

export function ExcelImportDialog({
  open,
  onOpenChange,
  onImport,
  parts,
}: ExcelImportDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [rawData, setRawData] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [partNumberColumn, setPartNumberColumn] = useState<string>('');
  const [quantityColumn, setQuantityColumn] = useState<string>('none');
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);

  // Reset state when dialog closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setStep('upload');
      setRawData([]);
      setHeaders([]);
      setPartNumberColumn('');
      setQuantityColumn('none');
      setProcessedItems([]);
    }
    onOpenChange(newOpen);
  }, [onOpenChange]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text
        .split(/[\n\r]+/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length > 0) {
        // Detect delimiter
        const firstLine = lines[0];
        let delimiter = ',';
        if (firstLine.includes('\t')) delimiter = '\t';
        else if (firstLine.includes(';')) delimiter = ';';

        // Parse all rows
        const parsedRows = lines.map(line => ({
          data: line.split(delimiter).map(cell => cell.trim()),
        }));

        // First row as headers
        const headerRow = parsedRows[0].data;
        setHeaders(headerRow);
        setRawData(parsedRows.slice(1));
        setStep('columns');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, []);

  // Find matching parts and alternatives
  const findMatches = useCallback((partNumber: string): { exact: Part | null; alternatives: Part[] } => {
    const searchValue = partNumber.toLowerCase().trim();
    if (searchValue.length < 2) return { exact: null, alternatives: [] };

    // Exact match
    const exact = parts.find(p => 
      p.partNumber.toLowerCase() === searchValue
    ) || null;

    if (exact) return { exact, alternatives: [] };

    // Find alternatives (partial matches)
    const alternatives = parts.filter(p => 
      p.partNumber.toLowerCase().includes(searchValue) ||
      searchValue.includes(p.partNumber.toLowerCase().slice(0, 8)) ||
      p.nameAr.includes(partNumber)
    ).slice(0, 5);

    return { exact: null, alternatives };
  }, [parts]);

  // Process data after column selection
  const handleProcessData = useCallback(() => {
    const partNumIdx = headers.indexOf(partNumberColumn);
    const qtyIdx = quantityColumn !== 'none' ? headers.indexOf(quantityColumn) : -1;

    const processed: ProcessedItem[] = rawData.map(row => {
      const originalPartNumber = row.data[partNumIdx] || '';
      const quantity = qtyIdx >= 0 ? (parseInt(row.data[qtyIdx]) || 1) : 1;
      
      const { exact, alternatives } = findMatches(originalPartNumber);

      return {
        originalPartNumber,
        quantity,
        matchedPart: exact,
        alternatives,
        selectedPart: exact,
      };
    }).filter(item => item.originalPartNumber.length > 0);

    setProcessedItems(processed);
    setStep('match');
  }, [rawData, headers, partNumberColumn, quantityColumn, findMatches]);

  // Select alternative for an item
  const handleSelectAlternative = useCallback((index: number, part: Part) => {
    setProcessedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], selectedPart: part };
      return updated;
    });
  }, []);

  // Final import
  const handleFinalImport = useCallback(() => {
    const itemsToImport = processedItems
      .filter(item => item.selectedPart)
      .map(item => ({
        part: item.selectedPart!,
        quantity: item.quantity,
      }));

    onImport(itemsToImport);
    handleOpenChange(false);
  }, [processedItems, onImport, handleOpenChange]);

  // Stats
  const stats = useMemo(() => {
    const total = processedItems.length;
    const matched = processedItems.filter(i => i.matchedPart).length;
    const withAlternatives = processedItems.filter(i => !i.matchedPart && i.alternatives.length > 0).length;
    const notFound = processedItems.filter(i => !i.matchedPart && i.alternatives.length === 0).length;
    const selected = processedItems.filter(i => i.selectedPart).length;

    return { total, matched, withAlternatives, notFound, selected };
  }, [processedItems]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            استيراد من ملف Excel
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4 border-b">
          {[
            { key: 'upload', label: 'رفع الملف' },
            { key: 'columns', label: 'تحديد الأعمدة' },
            { key: 'match', label: 'مطابقة القطع' },
          ].map((s, idx) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                  step === s.key
                    ? 'bg-primary text-primary-foreground'
                    : s.key === 'upload' && step !== 'upload'
                    ? 'bg-primary/20 text-primary'
                    : s.key === 'columns' && (step === 'match' || step === 'review')
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {idx + 1}
              </div>
              <span className={cn(
                'text-sm',
                step === s.key ? 'font-medium text-foreground' : 'text-muted-foreground'
              )}>
                {s.label}
              </span>
              {idx < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-auto py-4">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">رفع ملف Excel أو CSV</h3>
                <p className="text-sm text-muted-foreground">
                  يدعم ملفات CSV و TXT مفصولة بفاصلة أو Tab
                </p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.txt,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  اختر ملف
                </div>
              </label>
            </div>
          )}

          {/* Step 2: Column Selection */}
          {step === 'columns' && (
            <div className="space-y-6 px-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  تم قراءة <strong className="text-foreground">{rawData.length}</strong> سطر من الملف.
                  حدد الأعمدة المطلوبة:
                </p>
              </div>

              {/* Preview table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {headers.map((h, i) => (
                          <th key={i} className="px-4 py-2 text-right font-medium border-l first:border-l-0">
                            {h || `عمود ${i + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawData.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-t">
                          {row.data.map((cell, j) => (
                            <td key={j} className="px-4 py-2 border-l first:border-l-0 text-muted-foreground">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Column selection */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">عمود رقم القطعة *</Label>
                  <Select value={partNumberColumn} onValueChange={setPartNumberColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العمود" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((h, i) => (
                        <SelectItem key={i} value={h || `col_${i}`}>
                          {h || `عمود ${i + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">عمود الكمية (اختياري)</Label>
                  <Select value={quantityColumn} onValueChange={setQuantityColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="الافتراضي: 1" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">الافتراضي: 1</SelectItem>
                      {headers.map((h, i) => (
                        <SelectItem key={i} value={h || `col_${i}`}>
                          {h || `عمود ${i + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Matching */}
          {step === 'match' && (
            <div className="space-y-4 px-4">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">إجمالي</div>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.matched}</div>
                  <div className="text-xs text-green-600">مطابق</div>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.withAlternatives}</div>
                  <div className="text-xs text-yellow-600">بدائل متاحة</div>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.notFound}</div>
                  <div className="text-xs text-red-600">غير موجود</div>
                </div>
              </div>

              {/* Items list */}
              <ScrollArea className="h-[400px] border rounded-lg">
                <div className="divide-y">
                  {processedItems.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        'p-4',
                        item.matchedPart
                          ? 'bg-green-500/5'
                          : item.alternatives.length > 0
                          ? 'bg-yellow-500/5'
                          : 'bg-red-500/5'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Status icon */}
                        <div className="pt-1">
                          {item.matchedPart ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : item.alternatives.length > 0 ? (
                            <Search className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-mono text-sm font-medium">
                                {item.originalPartNumber}
                              </span>
                              <Badge variant="outline" className="mr-2">
                                الكمية: {item.quantity}
                              </Badge>
                            </div>
                            {item.selectedPart && (
                              <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                                تم الاختيار
                              </Badge>
                            )}
                          </div>

                          {/* Matched part info */}
                          {item.matchedPart && (
                            <div className="text-sm text-muted-foreground">
                              ✓ {item.matchedPart.nameAr} - {item.matchedPart.price.toFixed(2)} ر.س
                            </div>
                          )}

                          {/* Alternatives */}
                          {!item.matchedPart && item.alternatives.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">اختر من البدائل:</p>
                              <RadioGroup
                                value={item.selectedPart?.id || ''}
                                onValueChange={(value) => {
                                  const part = item.alternatives.find(p => p.id === value);
                                  if (part) handleSelectAlternative(index, part);
                                }}
                              >
                                {item.alternatives.map((alt) => (
                                  <div
                                    key={alt.id}
                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                                    onClick={() => handleSelectAlternative(index, alt)}
                                  >
                                    <RadioGroupItem value={alt.id} id={`alt-${index}-${alt.id}`} />
                                    <Label htmlFor={`alt-${index}-${alt.id}`} className="flex-1 cursor-pointer">
                                      <span className="font-mono text-sm">{alt.partNumber}</span>
                                      <span className="text-muted-foreground mx-2">-</span>
                                      <span className="text-sm">{alt.nameAr}</span>
                                      <span className="text-primary font-medium mr-2">
                                        {alt.price.toFixed(2)} ر.س
                                      </span>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          )}

                          {/* Not found */}
                          {!item.matchedPart && item.alternatives.length === 0 && (
                            <p className="text-sm text-red-500">
                              لم يتم العثور على هذه القطعة أو بدائل لها
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="border-t pt-4">
          {step === 'columns' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                رجوع
              </Button>
              <Button
                onClick={handleProcessData}
                disabled={!partNumberColumn}
              >
                معالجة البيانات
              </Button>
            </>
          )}

          {step === 'match' && (
            <>
              <Button variant="outline" onClick={() => setStep('columns')}>
                رجوع
              </Button>
              <Button
                onClick={handleFinalImport}
                disabled={stats.selected === 0}
              >
                استيراد {stats.selected} قطعة
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
