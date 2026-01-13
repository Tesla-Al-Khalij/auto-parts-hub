import { useState, useMemo } from 'react';
import { Package, Search, X, Calendar, Plus, LayoutGrid, Table2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { DataTablePagination } from '@/components/ui/data-table-controls';
import { mockOrders } from '@/data/mockData';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useDraftOrder } from '@/contexts/DraftOrderContext';
import { Order } from '@/types';

type SortField = 'date' | 'orderNumber' | 'total' | 'itemsCount';
type SortDirection = 'asc' | 'desc';

export default function Orders() {
  const navigate = useNavigate();
  const { setDraftOrder } = useDraftOrder();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleEditDraft = (order: Order) => {
    setDraftOrder(order);
    navigate('/');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFrom || dateTo;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const filteredOrders = useMemo(() => {
    const filtered = mockOrders.filter(order => {
      // Search filter
      const matchesSearch = !searchQuery || 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.includes(searchQuery)
        );

      // Tab filter
      let matchesTab = true;
      if (activeTab === 'drafts') matchesTab = order.isDraft;
      else if (activeTab === 'active') matchesTab = !order.isDraft && ['pending', 'confirmed', 'shipped'].includes(order.status);
      else if (activeTab === 'completed') matchesTab = ['delivered', 'cancelled'].includes(order.status);

      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      // Date filter
      const orderDate = new Date(order.date);
      const matchesDateFrom = !dateFrom || orderDate >= dateFrom;
      const matchesDateTo = !dateTo || orderDate <= dateTo;

      return matchesSearch && matchesTab && matchesStatus && matchesDateFrom && matchesDateTo;
    });

    // Sort
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'orderNumber':
          comparison = a.orderNumber.localeCompare(b.orderNumber);
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'itemsCount':
          comparison = a.items.length - b.items.length;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [searchQuery, activeTab, statusFilter, dateFrom, dateTo, sortField, sortDirection]);

  // Paginated orders
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const draftsCount = mockOrders.filter(o => o.isDraft).length;
  const activeCount = mockOrders.filter(o => !o.isDraft && ['pending', 'confirmed', 'shipped'].includes(o.status)).length;
  const completedCount = mockOrders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">طلباتي</h1>
              <p className="text-muted-foreground">عرض وتتبع جميع طلباتك</p>
            </div>
          </div>
          <Link to="/">
            <Button size="lg" className="gap-2 h-12">
              <Plus className="h-5 w-5" />
              طلب جديد
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          {/* Main search */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input
              placeholder="ابحث برقم الطلب أو رقم القطعة..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-14 pr-14 text-lg"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2"
                onClick={() => handleSearchChange('')}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Status filter */}
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px] h-12">
                  <SelectValue placeholder="حالة الطلب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="confirmed">تم التأكيد</SelectItem>
                  <SelectItem value="shipped">تم الشحن</SelectItem>
                  <SelectItem value="delivered">تم التسليم</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>

              {/* Date from */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-12 gap-2 min-w-[160px] justify-start">
                    <Calendar className="h-5 w-5" />
                    {dateFrom ? format(dateFrom, 'dd/MM/yyyy', { locale: ar }) : 'من تاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => { setDateFrom(date); setCurrentPage(1); }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Date to */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-12 gap-2 min-w-[160px] justify-start">
                    <Calendar className="h-5 w-5" />
                    {dateTo ? format(dateTo, 'dd/MM/yyyy', { locale: ar }) : 'إلى تاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => { setDateTo(date); setCurrentPage(1); }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="h-12 text-destructive">
                  <X className="h-4 w-4 ml-2" />
                  مسح الفلاتر
                </Button>
              )}
            </div>

            {/* View mode toggle */}
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'cards' | 'table')}>
              <ToggleGroupItem value="cards" aria-label="عرض البطاقات" className="h-12 px-4">
                <LayoutGrid className="h-5 w-5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="عرض الجدول" className="h-12 px-4">
                <Table2 className="h-5 w-5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} dir="rtl">
          <TabsList className="w-full h-auto p-1 grid grid-cols-4">
            <TabsTrigger value="all" className="h-12 text-base">
              الكل ({mockOrders.length})
            </TabsTrigger>
            <TabsTrigger value="drafts" className="h-12 text-base">
              المسودات ({draftsCount})
            </TabsTrigger>
            <TabsTrigger value="active" className="h-12 text-base">
              النشطة ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="completed" className="h-12 text-base">
              المكتملة ({completedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {viewMode === 'cards' ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {paginatedOrders.map(order => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <OrdersTable 
                    orders={paginatedOrders} 
                    startIndex={startIndex}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onEditDraft={handleEditDraft}
                  />
                )}
                
                {/* Pagination */}
                <div className="bg-card rounded-lg border shadow-sm">
                  <DataTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    onPageChange={setCurrentPage}
                    pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  لا توجد طلبات
                </h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters 
                    ? 'لم يتم العثور على طلبات مطابقة للفلاتر المحددة'
                    : 'لم تقم بإنشاء أي طلبات بعد'
                  }
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    مسح الفلاتر
                  </Button>
                ) : (
                  <Link to="/">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      إنشاء طلب جديد
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
