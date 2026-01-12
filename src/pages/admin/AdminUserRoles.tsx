import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Key,
  Lock,
  UserCog,
  Eye,
  Edit,
  Trash,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Role types
interface Permission {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  category: 'parts' | 'orders' | 'customers' | 'suppliers' | 'reports' | 'settings' | 'users';
}

interface Role {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  color: string;
  permissions: string[];
  isSystem: boolean;
  usersCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

// Permissions list
const allPermissions: Permission[] = [
  // Parts
  { id: 'parts.view', name: 'View Parts', nameAr: 'عرض القطع', description: 'مشاهدة قائمة القطع', category: 'parts' },
  { id: 'parts.create', name: 'Create Parts', nameAr: 'إضافة قطع', description: 'إضافة قطع جديدة', category: 'parts' },
  { id: 'parts.edit', name: 'Edit Parts', nameAr: 'تعديل القطع', description: 'تعديل بيانات القطع', category: 'parts' },
  { id: 'parts.delete', name: 'Delete Parts', nameAr: 'حذف القطع', description: 'حذف القطع', category: 'parts' },
  // Orders
  { id: 'orders.view', name: 'View Orders', nameAr: 'عرض الطلبات', description: 'مشاهدة قائمة الطلبات', category: 'orders' },
  { id: 'orders.create', name: 'Create Orders', nameAr: 'إنشاء طلبات', description: 'إنشاء طلبات جديدة', category: 'orders' },
  { id: 'orders.edit', name: 'Edit Orders', nameAr: 'تعديل الطلبات', description: 'تعديل الطلبات', category: 'orders' },
  { id: 'orders.delete', name: 'Delete Orders', nameAr: 'حذف الطلبات', description: 'حذف الطلبات', category: 'orders' },
  // Customers
  { id: 'customers.view', name: 'View Customers', nameAr: 'عرض العملاء', description: 'مشاهدة قائمة العملاء', category: 'customers' },
  { id: 'customers.create', name: 'Create Customers', nameAr: 'إضافة عملاء', description: 'إضافة عملاء جدد', category: 'customers' },
  { id: 'customers.edit', name: 'Edit Customers', nameAr: 'تعديل العملاء', description: 'تعديل بيانات العملاء', category: 'customers' },
  { id: 'customers.delete', name: 'Delete Customers', nameAr: 'حذف العملاء', description: 'حذف العملاء', category: 'customers' },
  // Suppliers
  { id: 'suppliers.view', name: 'View Suppliers', nameAr: 'عرض الموردين', description: 'مشاهدة قائمة الموردين', category: 'suppliers' },
  { id: 'suppliers.create', name: 'Create Suppliers', nameAr: 'إضافة موردين', description: 'إضافة موردين جدد', category: 'suppliers' },
  { id: 'suppliers.edit', name: 'Edit Suppliers', nameAr: 'تعديل الموردين', description: 'تعديل بيانات الموردين', category: 'suppliers' },
  { id: 'suppliers.delete', name: 'Delete Suppliers', nameAr: 'حذف الموردين', description: 'حذف الموردين', category: 'suppliers' },
  // Reports
  { id: 'reports.view', name: 'View Reports', nameAr: 'عرض التقارير', description: 'مشاهدة التقارير', category: 'reports' },
  { id: 'reports.export', name: 'Export Reports', nameAr: 'تصدير التقارير', description: 'تصدير التقارير', category: 'reports' },
  // Settings
  { id: 'settings.view', name: 'View Settings', nameAr: 'عرض الإعدادات', description: 'مشاهدة الإعدادات', category: 'settings' },
  { id: 'settings.edit', name: 'Edit Settings', nameAr: 'تعديل الإعدادات', description: 'تعديل الإعدادات', category: 'settings' },
  // Users & Roles
  { id: 'users.view', name: 'View Users', nameAr: 'عرض المستخدمين', description: 'مشاهدة قائمة المستخدمين', category: 'users' },
  { id: 'users.create', name: 'Create Users', nameAr: 'إضافة مستخدمين', description: 'إضافة مستخدمين جدد', category: 'users' },
  { id: 'users.edit', name: 'Edit Users', nameAr: 'تعديل المستخدمين', description: 'تعديل بيانات المستخدمين', category: 'users' },
  { id: 'users.delete', name: 'Delete Users', nameAr: 'حذف المستخدمين', description: 'حذف المستخدمين', category: 'users' },
  { id: 'roles.manage', name: 'Manage Roles', nameAr: 'إدارة الأدوار', description: 'إدارة أدوار المستخدمين', category: 'users' },
];

// Mock roles
const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    nameAr: 'مدير النظام',
    description: 'صلاحيات كاملة للنظام',
    color: 'bg-red-500',
    permissions: allPermissions.map(p => p.id),
    isSystem: true,
    usersCount: 1,
  },
  {
    id: 'manager',
    name: 'Manager',
    nameAr: 'مدير',
    description: 'إدارة المبيعات والمخزون',
    color: 'bg-blue-500',
    permissions: ['parts.view', 'parts.create', 'parts.edit', 'orders.view', 'orders.create', 'orders.edit', 'customers.view', 'customers.create', 'customers.edit', 'suppliers.view', 'reports.view'],
    isSystem: false,
    usersCount: 3,
  },
  {
    id: 'sales',
    name: 'Sales',
    nameAr: 'مبيعات',
    description: 'إدارة الطلبات والعملاء',
    color: 'bg-green-500',
    permissions: ['parts.view', 'orders.view', 'orders.create', 'customers.view', 'customers.create'],
    isSystem: false,
    usersCount: 5,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    nameAr: 'مشاهد',
    description: 'عرض فقط',
    color: 'bg-gray-500',
    permissions: ['parts.view', 'orders.view', 'customers.view', 'suppliers.view', 'reports.view'],
    isSystem: false,
    usersCount: 2,
  },
];

// Mock users
const mockUsers: User[] = [
  { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', roleId: 'admin', isActive: true, lastLogin: '2024-01-15', createdAt: '2023-06-01' },
  { id: '2', name: 'سارة علي', email: 'sara@example.com', roleId: 'manager', isActive: true, lastLogin: '2024-01-14', createdAt: '2023-08-15' },
  { id: '3', name: 'محمد خالد', email: 'mohammed@example.com', roleId: 'sales', isActive: true, lastLogin: '2024-01-15', createdAt: '2023-09-20' },
  { id: '4', name: 'فاطمة أحمد', email: 'fatima@example.com', roleId: 'sales', isActive: false, lastLogin: '2024-01-10', createdAt: '2023-10-05' },
  { id: '5', name: 'عمر حسن', email: 'omar@example.com', roleId: 'viewer', isActive: true, lastLogin: '2024-01-13', createdAt: '2023-11-12' },
];

const categoryLabels: Record<string, string> = {
  parts: 'القطع',
  orders: 'الطلبات',
  customers: 'العملاء',
  suppliers: 'الموردين',
  reports: 'التقارير',
  settings: 'الإعدادات',
  users: 'المستخدمين',
};

const AdminUserRoles = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  
  // Role dialog
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    color: 'bg-blue-500',
    permissions: [] as string[],
  });

  // User dialog
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    isActive: true,
  });

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(u => 
      u.name.includes(searchQuery) ||
      u.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const getRoleById = (roleId: string) => roles.find(r => r.id === roleId);

  // Role handlers
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      nameAr: role.nameAr,
      description: role.description,
      color: role.color,
      permissions: [...role.permissions],
    });
    setIsRoleDialogOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast({ title: 'خطأ', description: 'لا يمكن حذف دور النظام', variant: 'destructive' });
      return;
    }
    if (role && role.usersCount > 0) {
      toast({ title: 'خطأ', description: 'لا يمكن حذف دور مرتبط بمستخدمين', variant: 'destructive' });
      return;
    }
    setRoles(prev => prev.filter(r => r.id !== roleId));
    toast({ title: 'تم الحذف', description: 'تم حذف الدور بنجاح' });
  };

  const handleSubmitRole = () => {
    if (!roleFormData.nameAr) {
      toast({ title: 'خطأ', description: 'يرجى إدخال اسم الدور', variant: 'destructive' });
      return;
    }

    if (editingRole) {
      setRoles(prev => prev.map(r => 
        r.id === editingRole.id ? { ...r, ...roleFormData } : r
      ));
      toast({ title: 'تم التحديث', description: 'تم تحديث الدور بنجاح' });
    } else {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        ...roleFormData,
        isSystem: false,
        usersCount: 0,
      };
      setRoles(prev => [...prev, newRole]);
      toast({ title: 'تمت الإضافة', description: 'تم إضافة الدور بنجاح' });
    }

    setIsRoleDialogOpen(false);
    setEditingRole(null);
    setRoleFormData({ name: '', nameAr: '', description: '', color: 'bg-blue-500', permissions: [] });
  };

  const togglePermission = (permissionId: string) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // User handlers
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      isActive: user.isActive,
    });
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: 'تم الحذف', description: 'تم حذف المستخدم بنجاح' });
  };

  const handleSubmitUser = () => {
    if (!userFormData.name || !userFormData.email || !userFormData.roleId) {
      toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    if (editingUser) {
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id ? { ...u, ...userFormData } : u
      ));
      toast({ title: 'تم التحديث', description: 'تم تحديث المستخدم بنجاح' });
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        ...userFormData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers(prev => [...prev, newUser]);
      toast({ title: 'تمت الإضافة', description: 'تم إضافة المستخدم بنجاح' });
    }

    setIsUserDialogOpen(false);
    setEditingUser(null);
    setUserFormData({ name: '', email: '', roleId: '', isActive: true });
  };

  const toggleUserActive = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  const colorOptions = [
    { value: 'bg-red-500', label: 'أحمر' },
    { value: 'bg-blue-500', label: 'أزرق' },
    { value: 'bg-green-500', label: 'أخضر' },
    { value: 'bg-yellow-500', label: 'أصفر' },
    { value: 'bg-purple-500', label: 'بنفسجي' },
    { value: 'bg-pink-500', label: 'وردي' },
    { value: 'bg-gray-500', label: 'رمادي' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-l from-foreground to-foreground/70 bg-clip-text">
                الأدوار والصلاحيات
              </h1>
              <p className="text-muted-foreground">
                إدارة المستخدمين وصلاحياتهم
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المستخدمين</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الأدوار</p>
                  <p className="text-2xl font-bold">{roles.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">نشطين</p>
                  <p className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-100">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">غير نشطين</p>
                  <p className="text-2xl font-bold text-red-600">{users.filter(u => !u.isActive).length}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-100">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-muted/50">
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                المستخدمين
              </TabsTrigger>
              <TabsTrigger value="roles" className="gap-2">
                <Key className="h-4 w-4" />
                الأدوار
              </TabsTrigger>
            </TabsList>

            {activeTab === 'users' && (
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 shadow-md">
                    <Plus className="h-4 w-4" />
                    إضافة مستخدم
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
                    <DialogDescription>أدخل بيانات المستخدم</DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="userName">الاسم *</Label>
                      <Input
                        id="userName"
                        value={userFormData.name}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="اسم المستخدم"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="userEmail">البريد الإلكتروني *</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="userRole">الدور *</Label>
                      <Select value={userFormData.roleId} onValueChange={(v) => setUserFormData(prev => ({ ...prev, roleId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدور" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role.id} value={role.id}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${role.color}`} />
                                {role.nameAr}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="userActive">الحالة</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {userFormData.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                        <Switch
                          id="userActive"
                          checked={userFormData.isActive}
                          onCheckedChange={(v) => setUserFormData(prev => ({ ...prev, isActive: v }))}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleSubmitUser}>{editingUser ? 'تحديث' : 'إضافة'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {activeTab === 'roles' && (
              <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 shadow-md">
                    <Plus className="h-4 w-4" />
                    إضافة دور
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingRole ? 'تعديل الدور' : 'إضافة دور جديد'}</DialogTitle>
                    <DialogDescription>حدد اسم الدور والصلاحيات</DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="roleNameAr">اسم الدور بالعربي *</Label>
                        <Input
                          id="roleNameAr"
                          value={roleFormData.nameAr}
                          onChange={(e) => setRoleFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                          placeholder="مثال: مدير المبيعات"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="roleName">اسم الدور بالإنجليزي</Label>
                        <Input
                          id="roleName"
                          value={roleFormData.name}
                          onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Sales Manager"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="roleDescription">الوصف</Label>
                        <Input
                          id="roleDescription"
                          value={roleFormData.description}
                          onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="وصف مختصر للدور"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>اللون</Label>
                        <Select value={roleFormData.color} onValueChange={(v) => setRoleFormData(prev => ({ ...prev, color: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map(c => (
                              <SelectItem key={c.value} value={c.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${c.value}`} />
                                  {c.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">الصلاحيات</Label>
                      {Object.keys(categoryLabels).map(category => (
                        <Card key={category} className="border-muted">
                          <CardHeader className="py-3 px-4 bg-muted/30">
                            <CardTitle className="text-sm font-medium">{categoryLabels[category]}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-3">
                              {allPermissions.filter(p => p.category === category).map(permission => (
                                <div key={permission.id} className="flex items-center gap-2">
                                  <Checkbox
                                    id={permission.id}
                                    checked={roleFormData.permissions.includes(permission.id)}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                  />
                                  <Label htmlFor={permission.id} className="text-sm font-normal cursor-pointer">
                                    {permission.nameAr}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleSubmitRole}>{editingRole ? 'تحديث' : 'إضافة'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث بالاسم أو البريد..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 bg-background"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-right font-semibold">المستخدم</TableHead>
                      <TableHead className="text-right font-semibold">الدور</TableHead>
                      <TableHead className="text-right font-semibold">الحالة</TableHead>
                      <TableHead className="text-right font-semibold">آخر دخول</TableHead>
                      <TableHead className="text-right font-semibold">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const role = getRoleById(user.roleId);
                      return (
                        <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${role?.color || 'bg-gray-500'}`}>
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <div className={`w-2 h-2 rounded-full ${role?.color || 'bg-gray-500'}`} />
                              {role?.nameAr || 'غير محدد'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.isActive}
                                onCheckedChange={() => toggleUserActive(user.id)}
                              />
                              <span className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {user.isActive ? 'نشط' : 'غير نشط'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.lastLogin || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditUser(user)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteUser(user.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <Card key={role.id} className="border-0 shadow-md overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${role.color}`} />
                        <CardTitle className="text-lg">{role.nameAr}</CardTitle>
                      </div>
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-xs">نظام</Badge>
                      )}
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{role.usersCount} مستخدم</span>
                      <span className="mx-2">•</span>
                      <Key className="h-4 w-4" />
                      <span>{role.permissions.length} صلاحية</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 4).map(permId => {
                        const perm = allPermissions.find(p => p.id === permId);
                        return perm ? (
                          <Badge key={permId} variant="outline" className="text-xs">
                            {perm.nameAr}
                          </Badge>
                        ) : null;
                      })}
                      {role.permissions.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.permissions.length - 4}
                        </Badge>
                      )}
                    </div>
                    
                    {!role.isSystem && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => handleEditRole(role)}>
                          <Pencil className="h-3 w-3" />
                          تعديل
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteRole(role.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminUserRoles;
