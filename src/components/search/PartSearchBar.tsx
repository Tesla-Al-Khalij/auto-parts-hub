import { useState } from 'react';
import { Search, Upload, FileSpreadsheet, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface PartSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBulkImport: (partNumbers: string[]) => void;
}

export function PartSearchBar({ searchQuery, onSearchChange, onBulkImport }: PartSearchBarProps) {
  const [bulkText, setBulkText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleBulkSubmit = () => {
    const lines = bulkText
      .split(/[\n,;]/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال أرقام القطع',
        variant: 'destructive',
      });
      return;
    }

    onBulkImport(lines);
    setBulkText('');
    setDialogOpen(false);
    toast({
      title: 'تم الاستيراد',
      description: `تم البحث عن ${lines.length} رقم قطعة`,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setBulkText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Main search */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ابحث برقم القطعة... مثال: TOY-BRK-001"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-14 pr-14 text-lg placeholder:text-muted-foreground/60"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2"
            onClick={() => onSearchChange('')}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Bulk import button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="w-full gap-3 h-14 text-base">
            <FileSpreadsheet className="h-6 w-6" />
            استيراد متعدد (نسخ/لصق أو رفع ملف Excel)
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">استيراد أرقام القطع</DialogTitle>
            <DialogDescription>
              أدخل أرقام القطع أو ارفع ملف Excel
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Text input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                أرقام القطع (كل رقم في سطر جديد)
              </label>
              <Textarea
                placeholder={`TOY-BRK-001\nTOY-FLT-002\nHND-BRK-001`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="min-h-[150px] text-base"
                dir="ltr"
              />
            </div>

            {/* File upload */}
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-border" />
              <span className="text-muted-foreground text-sm">أو</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">اضغط لرفع ملف</p>
                <p className="text-sm text-muted-foreground">CSV, TXT, Excel</p>
              </div>
              <input
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {/* Submit */}
            <Button 
              size="lg" 
              className="w-full h-14 text-lg"
              onClick={handleBulkSubmit}
              disabled={!bulkText.trim()}
            >
              <Search className="h-5 w-5 ml-2" />
              بحث عن القطع
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
