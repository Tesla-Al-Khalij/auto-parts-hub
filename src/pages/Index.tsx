import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PartSearchBar } from '@/components/search/PartSearchBar';
import { PartCard } from '@/components/search/PartCard';
import { mockParts } from '@/data/mockData';
import { Package, Search, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Get unique categories from parts
const categories = [...new Set(mockParts.map(p => p.category))];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkPartNumbers, setBulkPartNumbers] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query for performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter parts based on search query, category, and stock
  const filteredParts = useMemo(() => {
    let results = mockParts;

    // Apply bulk import filter first
    if (bulkPartNumbers.length > 0) {
      results = results.filter(part =>
        bulkPartNumbers.some(pn =>
          part.partNumber.toLowerCase().includes(pn.toLowerCase()) ||
          pn.toLowerCase().includes(part.partNumber.toLowerCase())
        )
      );
    } else if (debouncedSearch.trim()) {
      // Apply search filter
      const query = debouncedSearch.toLowerCase();
      results = results.filter(part =>
        part.partNumber.toLowerCase().includes(query) ||
        part.name.toLowerCase().includes(query) ||
        part.nameAr.includes(debouncedSearch) ||
        part.brand.toLowerCase().includes(query)
      );
    } else {
      return []; // Show nothing until user searches
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      results = results.filter(part => part.category === selectedCategory);
    }

    // Apply stock filter
    if (stockFilter === 'inStock') {
      results = results.filter(part => part.stock > 0);
    } else if (stockFilter === 'outOfStock') {
      results = results.filter(part => part.stock <= 0);
    } else if (stockFilter === 'lowStock') {
      results = results.filter(part => part.stock > 0 && part.stock <= 10);
    }

    return results;
  }, [debouncedSearch, bulkPartNumbers, selectedCategory, stockFilter]);

  const handleBulkImport = (partNumbers: string[]) => {
    setBulkPartNumbers(partNumbers);
    setSearchQuery('');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setBulkPartNumbers([]); // Clear bulk import when typing
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            البحث عن قطع الغيار
          </h1>
          <p className="text-muted-foreground text-lg">
            ابحث برقم القطعة أو استورد قائمة من ملف Excel
          </p>
        </div>

        {/* Search bar */}
        <PartSearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onBulkImport={handleBulkImport}
        />

        {/* Filters */}
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            فلترة النتائج
            {(selectedCategory !== 'all' || stockFilter !== 'all') && (
              <Badge variant="secondary" className="mr-1">
                {[selectedCategory !== 'all', stockFilter !== 'all'].filter(Boolean).length}
              </Badge>
            )}
          </Button>

          {showFilters && (
            <div className="flex flex-wrap gap-3 p-4 bg-secondary/30 rounded-lg animate-fade-in">
              {/* Category filter */}
              <div className="space-y-1.5 min-w-[160px]">
                <label className="text-sm font-medium text-muted-foreground">التصنيف</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="جميع التصنيفات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التصنيفات</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'engine' && 'المحرك'}
                        {cat === 'brakes' && 'الفرامل'}
                        {cat === 'filters' && 'الفلاتر'}
                        {cat === 'electrical' && 'الكهرباء'}
                        {cat === 'cooling' && 'التبريد'}
                        {cat === 'transmission' && 'ناقل الحركة'}
                        {cat === 'body' && 'البودي'}
                        {cat === 'sensors' && 'الحساسات'}
                        {cat === 'oils' && 'الزيوت'}
                        {cat === 'accessories' && 'الإكسسوارات'}
                        {!['engine', 'brakes', 'filters', 'electrical', 'cooling', 'transmission', 'body', 'sensors', 'oils', 'accessories'].includes(cat) && cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock filter */}
              <div className="space-y-1.5 min-w-[160px]">
                <label className="text-sm font-medium text-muted-foreground">التوفر</label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="جميع المنتجات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المنتجات</SelectItem>
                    <SelectItem value="inStock">متوفر</SelectItem>
                    <SelectItem value="lowStock">مخزون منخفض</SelectItem>
                    <SelectItem value="outOfStock">غير متوفر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear filters */}
              {(selectedCategory !== 'all' || stockFilter !== 'all') && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('all');
                      setStockFilter('all');
                    }}
                    className="text-muted-foreground"
                  >
                    مسح الفلاتر
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Results count */}
          {(searchQuery || bulkPartNumbers.length > 0) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-5 w-5" />
              <span>
                تم العثور على <strong className="text-foreground">{filteredParts.length}</strong> قطعة
              </span>
              {bulkPartNumbers.length > 0 && (
                <button
                  onClick={() => setBulkPartNumbers([])}
                  className="text-primary hover:underline mr-2"
                >
                  (مسح البحث المتعدد)
                </button>
              )}
            </div>
          )}

          {/* No search yet */}
          {!searchQuery && bulkPartNumbers.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  ابدأ البحث
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  أدخل رقم القطعة في مربع البحث أعلاه أو استخدم استيراد متعدد للبحث عن عدة قطع
                </p>
              </div>
            </div>
          )}

          {/* No results */}
          {(searchQuery || bulkPartNumbers.length > 0) && filteredParts.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  لم يتم العثور على نتائج
                </h3>
                <p className="text-muted-foreground">
                  جرب البحث برقم قطعة مختلف
                </p>
              </div>
            </div>
          )}

          {/* Parts grid */}
          {filteredParts.length > 0 && (
            <div className="grid gap-4">
              {filteredParts.map((part) => (
                <PartCard key={part.id} part={part} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
