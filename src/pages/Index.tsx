import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PartSearchBar } from '@/components/search/PartSearchBar';
import { PartCard } from '@/components/search/PartCard';
import { mockParts } from '@/data/mockData';
import { Package, Search } from 'lucide-react';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkPartNumbers, setBulkPartNumbers] = useState<string[]>([]);

  // Filter parts based on search query or bulk import
  const filteredParts = useMemo(() => {
    if (bulkPartNumbers.length > 0) {
      // Search by multiple part numbers (bulk import)
      return mockParts.filter(part =>
        bulkPartNumbers.some(pn =>
          part.partNumber.toLowerCase().includes(pn.toLowerCase()) ||
          pn.toLowerCase().includes(part.partNumber.toLowerCase())
        )
      );
    }

    if (!searchQuery.trim()) {
      return []; // Show nothing until user searches
    }

    const query = searchQuery.toLowerCase();
    return mockParts.filter(part =>
      part.partNumber.toLowerCase().includes(query) ||
      part.name.toLowerCase().includes(query) ||
      part.nameAr.includes(searchQuery) ||
      part.brand.toLowerCase().includes(query)
    );
  }, [searchQuery, bulkPartNumbers]);

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
