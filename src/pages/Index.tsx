import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PartSearchBar } from '@/components/search/PartSearchBar';
import { PartCard } from '@/components/search/PartCard';
import { QuickOrderGrid } from '@/components/search/QuickOrderGrid';
import { useCachedParts } from '@/hooks/useCachedParts';
import { Package, Search, Filter, ChevronRight, ChevronLeft, ArrowUpDown, LayoutGrid, Table2, Database, CloudOff, RefreshCw } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ITEMS_PER_PAGE = 10;

type ViewMode = 'search' | 'grid';

const Index = () => {
  const { parts, isLoading, isFromCache, lastUpdated, refresh } = useCachedParts();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkPartNumbers, setBulkPartNumbers] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('default');

  // Get unique categories from cached parts
  const categories = useMemo(() => [...new Set(parts.map(p => p.category))], [parts]);

  // Debounce search query for performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter parts based on search query, category, and stock
  const filteredParts = useMemo(() => {
    let results = parts;

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

  // Sort parts
  const sortedParts = useMemo(() => {
    if (sortBy === 'default') return filteredParts;
    
    return [...filteredParts].sort((a, b) => {
      switch (sortBy) {
        case 'priceAsc':
          return a.price - b.price;
        case 'priceDesc':
          return b.price - a.price;
        case 'stockAsc':
          return a.stock - b.stock;
        case 'stockDesc':
          return b.stock - a.stock;
        case 'nameAsc':
          return a.nameAr.localeCompare(b.nameAr, 'ar');
        case 'nameDesc':
          return b.nameAr.localeCompare(a.nameAr, 'ar');
        default:
          return 0;
      }
    });
  }, [filteredParts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedParts.length / ITEMS_PER_PAGE);
  const paginatedParts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedParts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedParts, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, bulkPartNumbers, selectedCategory, stockFilter, sortBy]);

  // Keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setViewMode('search');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        setViewMode('grid');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
            {viewMode === 'search' 
              ? 'ابحث برقم القطعة أو استورد قائمة من ملف Excel'
              : 'طلب سريع - ادخل أرقام القطع والكميات مباشرة'
            }
          </p>
        </div>

        {/* Cache Status Indicator */}
        {isFromCache && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full">
              <CloudOff className="h-4 w-4" />
              <span>البيانات من الذاكرة المؤقتة</span>
              {lastUpdated && (
                <span className="text-amber-600 dark:text-amber-400">
                  ({lastUpdated.toLocaleDateString('ar-SA')})
                </span>
              )}
              {navigator.onLine && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800"
                  onClick={refresh}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex justify-center">
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => value && setViewMode(value as ViewMode)}
            className="bg-secondary/50 p-1 rounded-lg"
          >
            <ToggleGroupItem value="search" className="gap-2 px-4">
              <Search className="h-4 w-4" />
              بحث عادي
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" className="gap-2 px-4">
              <Table2 className="h-4 w-4" />
              طلب سريع
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Quick Order Grid Mode */}
        {viewMode === 'grid' ? (
          <QuickOrderGrid />
        ) : (
          <>
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
            {(selectedCategory !== 'all' || stockFilter !== 'all' || sortBy !== 'default') && (
              <Badge variant="secondary" className="mr-1">
                {[selectedCategory !== 'all', stockFilter !== 'all', sortBy !== 'default'].filter(Boolean).length}
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

              {/* Sort by */}
              <div className="space-y-1.5 min-w-[180px]">
                <label className="text-sm font-medium text-muted-foreground">الترتيب</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10">
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                    <SelectValue placeholder="الترتيب الافتراضي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">الترتيب الافتراضي</SelectItem>
                    <SelectItem value="priceAsc">السعر: من الأقل للأعلى</SelectItem>
                    <SelectItem value="priceDesc">السعر: من الأعلى للأقل</SelectItem>
                    <SelectItem value="stockDesc">المخزون: من الأعلى للأقل</SelectItem>
                    <SelectItem value="stockAsc">المخزون: من الأقل للأعلى</SelectItem>
                    <SelectItem value="nameAsc">الاسم: أ - ي</SelectItem>
                    <SelectItem value="nameDesc">الاسم: ي - أ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear filters */}
              {(selectedCategory !== 'all' || stockFilter !== 'all' || sortBy !== 'default') && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('all');
                      setStockFilter('all');
                      setSortBy('default');
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
          {paginatedParts.length > 0 && (
            <>
              <div className="grid gap-4">
                {paginatedParts.map((part) => (
                  <PartCard key={part.id} part={part} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      // Show first, last, current, and adjacent pages
                      const showPage = page === 1 || 
                        page === totalPages || 
                        Math.abs(page - currentPage) <= 1;
                      
                      const showEllipsis = page === 2 && currentPage > 3 ||
                        page === totalPages - 1 && currentPage < totalPages - 2;

                      if (showEllipsis && !showPage) {
                        return <span key={page} className="px-2 text-muted-foreground">...</span>;
                      }

                      if (!showPage) return null;

                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="icon"
                          className="w-10 h-10"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm text-muted-foreground mr-4">
                    صفحة {currentPage} من {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
