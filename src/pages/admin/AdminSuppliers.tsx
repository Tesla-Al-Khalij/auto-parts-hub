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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Truck,
  Mail,
  Phone,
  MapPin,
  Globe
} from 'lucide-react';
import { mockSuppliers } from '@/data/mockData';
import { Supplier } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useTableControls } from '@/hooks/useTableControls';
import { DataTablePagination, SortableHeader } from '@/components/ui/data-table-controls';

// Extended supplier type for admin
interface ExtendedSupplier extends Supplier {
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  website?: string;
  notes?: string;
  isActive: boolean;
}

// Create extended mock suppliers
const extendedMockSuppliers: ExtendedSupplier[] = mockSuppliers.map((s, index) => ({
  ...s,
  email: `contact@${s.name.toLowerCase().replace(/\s+/g, '-')}.com`,
  phone: `+966 5${index}${index} 123 4567`,
  address: 'المنطقة الصناعية',
  city: index % 2 === 0 ? 'الرياض' : 'جدة',
  isActive: true,
}));

const AdminSuppliers = () => {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<ExtendedSupplier[]>(extendedMockSuppliers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<ExtendedSupplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    website: '',
    notes: '',
  });

  // Use table controls
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
  } = useTableControls<ExtendedSupplier>({
    data: suppliers,
    initialPageSize: 10,
    initialSortKey: 'nameAr',
    initialSortDirection: 'asc',
    searchableFields: ['name', 'nameAr', 'email', 'city'],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      website: '',
      notes: '',
    });
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: ExtendedSupplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      nameAr: supplier.nameAr,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      website: supplier.website || '',
      notes: supplier.notes || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (supplierId: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    toast({
      title: 'تم الحذف',
      description: 'تم حذف المورد بنجاح',
    });
  };

  const handleToggleActive = (supplierId: string) => {
    setSuppliers(prev => prev.map(s => 
      s.id === supplierId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.nameAr) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => 
        s.id === editingSupplier.id 
          ? { ...s, ...formData }
          : s
      ));
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث بيانات المورد بنجاح',
      });
    } else {
      const newSupplier: ExtendedSupplier = {
        id: `new-${Date.now()}`,
        ...formData,
        isActive: true,
      };
      setSuppliers(prev => [newSupplier, ...prev]);
      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة المورد بنجاح',
      });
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إدارة الموردين</h1>
              <p className="text-muted-foreground">
                إجمالي {suppliers.length} مورد
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
                إضافة مورد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
                </DialogTitle>
                <DialogDescription>
                  {editingSupplier ? 'قم بتعديل بيانات المورد' : 'أدخل بيانات المورد الجديد'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="nameAr">اسم المورد بالعربي *</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                    placeholder="مثال: شركة القطع المميزة"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="name">اسم المورد بالإنجليزي *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="مثال: Premium Parts Co"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">رقم الجوال</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+966 5X XXX XXXX"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="العنوان التفصيلي"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="مثال: الرياض"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="website">الموقع الإلكتروني</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="ملاحظات إضافية..."
                    rows={3}
                  />
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
                  {editingSupplier ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو البريد أو المدينة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-background"
              />
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-right">
                      <SortableHeader
                        label="المورد"
                        sortKey="nameAr"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">التواصل</TableHead>
                    <TableHead className="text-right">
                      <SortableHeader
                        label="المدينة"
                        sortKey="city"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((supplier) => (
                    <TableRow key={supplier.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium">{supplier.nameAr}</p>
                          <p className="text-sm text-muted-foreground">{supplier.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {supplier.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{supplier.email}</span>
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span dir="ltr">{supplier.phone}</span>
                            </div>
                          )}
                          {supplier.website && (
                            <div className="flex items-center gap-1 text-sm">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                              <span>{supplier.website}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {supplier.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {supplier.city}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={supplier.isActive ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => handleToggleActive(supplier.id)}
                        >
                          {supplier.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(supplier)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(supplier.id)}
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

export default AdminSuppliers;
