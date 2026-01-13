import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Package,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Copy,
  Boxes
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockParts } from '@/data/mockData';
import { Part } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useTableControls } from '@/hooks/useTableControls';
import { DataTablePagination, SortableHeader } from '@/components/ui/data-table-controls';

const categories = [
  { value: 'engine', label: 'المحرك' },
  { value: 'brakes', label: 'الفرامل' },
  { value: 'filters', label: 'الفلاتر' },
  { value: 'electrical', label: 'الكهرباء' },
  { value: 'cooling', label: 'التبريد' },
  { value: 'transmission', label: 'ناقل الحركة' },
  { value: 'body', label: 'البودي' },
  { value: 'sensors', label: 'الحساسات' },
  { value: 'oils', label: 'الزيوت' },
  { value: 'accessories', label: 'الإكسسوارات' },
];

const AdminParts = () => {
  const { toast } = useToast();
  const [parts, setParts] = useState<Part[]>(mockParts);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    nameAr: '',
    brand: '',
    category: '',
    price: '',
    stock: '',
    unit: 'قطعة',
  });

  // Calculate stats
  const totalParts = parts.length;
  const inStockParts = parts.filter(p => p.stock > 0).length;
  const lowStockParts = parts.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockParts = parts.filter(p => p.stock <= 0).length;

  // Filter by category first
  const categoryFilteredParts = categoryFilter === 'all' 
    ? parts 
    : parts.filter(p => p.category === categoryFilter);

  // Use table controls for pagination, sorting, and search
  const {
    paginatedData,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    sortConfig,
    handleSort,
    searchQuery,
    setSearchQuery,
  } = useTableControls<Part>({
    data: categoryFilteredParts,
    initialPageSize: 10,
    initialSortKey: 'partNumber',
    initialSortDirection: 'asc',
    searchableFields: ['partNumber', 'name', 'nameAr', 'brand'],
  });

  const resetForm = () => {
    setFormData({
      partNumber: '',
      name: '',
      nameAr: '',
      brand: '',
      category: '',
      price: '',
      stock: '',
      unit: 'قطعة',
    });
    setEditingPart(null);
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setFormData({
      partNumber: part.partNumber,
      name: part.name,
      nameAr: part.nameAr,
      brand: part.brand,
      category: part.category,
      price: part.price.toString(),
      stock: part.stock.toString(),
      unit: part.unit,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (partId: string) => {
    setParts(prev => prev.filter(p => p.id !== partId));
    toast({
      title: 'تم الحذف',
      description: 'تم حذف القطعة بنجاح',
    });
  };

  const handleSubmit = () => {
    if (!formData.partNumber || !formData.nameAr || !formData.category || !formData.price) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    if (editingPart) {
      setParts(prev => prev.map(p => 
        p.id === editingPart.id 
          ? {
              ...p,
              ...formData,
              price: parseFloat(formData.price),
              stock: parseInt(formData.stock) || 0,
            }
          : p
      ));
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث القطعة بنجاح',
      });
    } else {
      const newPart: Part = {
        id: `new-${Date.now()}`,
        partNumber: formData.partNumber,
        name: formData.name,
        nameAr: formData.nameAr,
        brand: formData.brand,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        unit: formData.unit,
      };
      setParts(prev => [newPart, ...prev]);
      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة القطعة بنجاح',
      });
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const getCategoryLabel = (value: string) => {
    return categories.find(c => c.value === value)?.label || value;
  };

  const getStockBadge = (stock: number, unit: string) => {
    if (stock <= 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          نفذ
        </Badge>
      );
    }
    if (stock <= 10) {
      return (
        <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          {stock} {unit}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        {stock} {unit}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Boxes className="h-4 w-4" />
                <span>إدارة المخزون</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                إدارة القطع
              </h1>
              <p className="text-muted-foreground">
                إدارة وتنظيم جميع قطع الغيار في المخزون
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                تصدير
              </Button>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                استيراد
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2 shadow-lg shadow-primary/25">
                    <Plus className="h-4 w-4" />
                    إضافة قطعة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPart ? 'تعديل القطعة' : 'إضافة قطعة جديدة'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPart ? 'قم بتعديل بيانات القطعة' : 'أدخل بيانات القطعة الجديدة'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="partNumber">رقم القطعة *</Label>
                      <Input
                        id="partNumber"
                        value={formData.partNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
                        placeholder="مثال: TOY-BRK-001"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="nameAr">الاسم بالعربي *</Label>
                      <Input
                        id="nameAr"
                        value={formData.nameAr}
                        onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                        placeholder="مثال: فحمات فرامل أمامية"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="name">الاسم بالإنجليزي</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="مثال: Front Brake Pads"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="brand">الماركة</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                          placeholder="مثال: Toyota"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="category">التصنيف *</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر التصنيف" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">السعر *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="stock">المخزون</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="unit">الوحدة</Label>
                        <Select 
                          value={formData.unit} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="قطعة">قطعة</SelectItem>
                            <SelectItem value="طقم">طقم</SelectItem>
                            <SelectItem value="لتر">لتر</SelectItem>
                            <SelectItem value="متر">متر</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}>
                      إلغاء
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingPart ? 'تحديث' : 'إضافة'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500/10 to-blue-600/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalParts}</p>
                  <p className="text-sm text-muted-foreground">إجمالي القطع</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inStockParts}</p>
                  <p className="text-sm text-muted-foreground">متوفر</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500/10 to-orange-500/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lowStockParts}</p>
                  <p className="text-sm text-muted-foreground">مخزون منخفض</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-gradient-to-br from-red-500/10 to-red-600/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{outOfStockParts}</p>
                  <p className="text-sm text-muted-foreground">نفذ</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="بحث برقم القطعة أو الاسم أو الماركة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-11 h-11 bg-background text-base"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-11 bg-background">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="جميع التصنيفات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Parts Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
                    <TableHead className="text-right font-semibold">
                      <SortableHeader
                        label="رقم القطعة"
                        sortKey="partNumber"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      <SortableHeader
                        label="الاسم"
                        sortKey="nameAr"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      <SortableHeader
                        label="الماركة"
                        sortKey="brand"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right font-semibold">التصنيف</TableHead>
                    <TableHead className="text-right font-semibold">
                      <SortableHeader
                        label="السعر"
                        sortKey="price"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      <SortableHeader
                        label="المخزون"
                        sortKey="stock"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-center font-semibold w-[100px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((part, index) => (
                    <TableRow 
                      key={part.id} 
                      className={`hover:bg-muted/40 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                    >
                      <TableCell className="font-mono text-sm font-medium text-primary">
                        {part.partNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{part.nameAr}</p>
                          <p className="text-sm text-muted-foreground">{part.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{part.brand}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                          {getCategoryLabel(part.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold">
                        {part.price.toFixed(2)} <span className="text-muted-foreground font-normal text-xs">ر.س</span>
                      </TableCell>
                      <TableCell>
                        {getStockBadge(part.stock, part.unit)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => handleEdit(part)}>
                              <Pencil className="h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Copy className="h-4 w-4" />
                              نسخ
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive focus:text-destructive"
                              onClick={() => handleDelete(part.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="border-t">
              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminParts;
