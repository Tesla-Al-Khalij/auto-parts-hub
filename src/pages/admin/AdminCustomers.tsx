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
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Users,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { mockUserProfile } from '@/data/mockData';
import { UserProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useTableControls } from '@/hooks/useTableControls';
import { DataTablePagination, SortableHeader } from '@/components/ui/data-table-controls';

// Create mock customers from the user profile template
const mockCustomers: UserProfile[] = [
  mockUserProfile,
  {
    id: '2',
    companyName: 'ورشة الخليج للسيارات',
    contactName: 'خالد العمري',
    email: 'info@gulf-workshop.sa',
    phone: '+966 50 987 6543',
    address: 'شارع الأمير سلطان',
    city: 'جدة',
    taxNumber: '300987654321003',
    balance: -15000,
    creditLimit: 30000,
    creditTermDays: 60,
    usedCredit: 15000,
  },
  {
    id: '3',
    companyName: 'مركز السرعة للصيانة',
    contactName: 'فهد الشمري',
    email: 'speed@center.sa',
    phone: '+966 56 111 2222',
    address: 'شارع الملك عبدالعزيز',
    city: 'الدمام',
    balance: -8500,
    creditLimit: 25000,
    creditTermDays: 90,
    usedCredit: 8500,
  },
];

const AdminCustomers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<UserProfile[]>(mockCustomers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    taxNumber: '',
    creditLimit: '',
    creditTermDays: '60' as '60' | '90',
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
  } = useTableControls<UserProfile>({
    data: customers,
    initialPageSize: 10,
    initialSortKey: 'companyName',
    initialSortDirection: 'asc',
    searchableFields: ['companyName', 'contactName', 'email', 'phone', 'city'],
  });

  const resetForm = () => {
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      taxNumber: '',
      creditLimit: '',
      creditTermDays: '60',
    });
    setEditingCustomer(null);
  };

  const handleEdit = (customer: UserProfile) => {
    setEditingCustomer(customer);
    setFormData({
      companyName: customer.companyName,
      contactName: customer.contactName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      taxNumber: customer.taxNumber || '',
      creditLimit: customer.creditLimit.toString(),
      creditTermDays: customer.creditTermDays.toString() as '60' | '90',
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    toast({
      title: 'تم الحذف',
      description: 'تم حذف العميل بنجاح',
    });
  };

  const handleSubmit = () => {
    if (!formData.companyName || !formData.contactName || !formData.email) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    if (editingCustomer) {
      setCustomers(prev => prev.map(c => 
        c.id === editingCustomer.id 
          ? {
              ...c,
              ...formData,
              creditLimit: parseFloat(formData.creditLimit) || 0,
              creditTermDays: parseInt(formData.creditTermDays) as 60 | 90,
            }
          : c
      ));
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث بيانات العميل بنجاح',
      });
    } else {
      const newCustomer: UserProfile = {
        id: `new-${Date.now()}`,
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        taxNumber: formData.taxNumber,
        balance: 0,
        creditLimit: parseFloat(formData.creditLimit) || 0,
        creditTermDays: parseInt(formData.creditTermDays) as 60 | 90,
        usedCredit: 0,
      };
      setCustomers(prev => [newCustomer, ...prev]);
      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة العميل بنجاح',
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
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إدارة العملاء</h1>
              <p className="text-muted-foreground">
                إجمالي {customers.length} عميل
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
                إضافة عميل
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
                </DialogTitle>
                <DialogDescription>
                  {editingCustomer ? 'قم بتعديل بيانات العميل' : 'أدخل بيانات العميل الجديد'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">اسم الشركة / المؤسسة *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="مثال: ورشة السيارات"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="contactName">اسم المسؤول *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="مثال: محمد أحمد"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
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
                    <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                    <Input
                      id="taxNumber"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
                      placeholder="300XXXXXXXXX003"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="creditLimit">حد الائتمان</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="creditTermDays">مدة السداد (يوم)</Label>
                    <Input
                      id="creditTermDays"
                      type="number"
                      value={formData.creditTermDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, creditTermDays: e.target.value as '60' | '90' }))}
                      placeholder="60"
                    />
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
                  {editingCustomer ? 'تحديث' : 'إضافة'}
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
                placeholder="بحث بالاسم أو البريد أو الجوال أو المدينة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-background"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-right">
                      <SortableHeader
                        label="الشركة / المؤسسة"
                        sortKey="companyName"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortableHeader
                        label="المسؤول"
                        sortKey="contactName"
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
                    <TableHead className="text-right">
                      <SortableHeader
                        label="الرصيد"
                        sortKey="balance"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortableHeader
                        label="حد الائتمان"
                        sortKey="creditLimit"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{customer.companyName}</TableCell>
                      <TableCell>{customer.contactName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span dir="ltr">{customer.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {customer.city}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.balance < 0 ? 'destructive' : 'default'}>
                          {Math.abs(customer.balance).toLocaleString('ar-SA')} ر.س
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.creditLimit.toLocaleString('ar-SA')} ر.س
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(customer)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(customer.id)}
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

export default AdminCustomers;
