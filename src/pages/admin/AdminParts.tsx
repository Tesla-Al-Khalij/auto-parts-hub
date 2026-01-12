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
  Filter
} from 'lucide-react';
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إدارة القطع</h1>
              <p className="text-muted-foreground">
                إجمالي {parts.length} قطعة
              </p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md">
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

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث برقم القطعة أو الاسم أو الماركة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-background"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-background">
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
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-right">
                      <SortableHeader
                        label="رقم القطعة"
                        sortKey="partNumber"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortableHeader
                        label="الاسم"
                        sortKey="nameAr"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortableHeader
                        label="الماركة"
                        sortKey="brand"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">التصنيف</TableHead>
                    <TableHead className="text-right">
                      <SortableHeader
                        label="السعر"
                        sortKey="price"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortableHeader
                        label="المخزون"
                        sortKey="stock"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((part) => (
                    <TableRow key={part.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm">{part.partNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{part.nameAr}</p>
                          <p className="text-sm text-muted-foreground">{part.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>{part.brand}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getCategoryLabel(part.category)}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{part.price.toFixed(2)} ر.س</TableCell>
                      <TableCell>
                        <Badge variant={part.stock <= 0 ? 'destructive' : part.stock <= 10 ? 'outline' : 'default'}>
                          {part.stock} {part.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(part)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(part.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
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
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminParts;
