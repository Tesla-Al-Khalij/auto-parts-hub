import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Store, 
  Bell, 
  Shield, 
  Palette,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'متجر قطع الغيار',
    storeNameEn: 'Auto Parts Store',
    email: 'info@store.sa',
    phone: '+966 55 123 4567',
    address: 'الرياض، المملكة العربية السعودية',
    vatNumber: '300123456789003',
    vatRate: '15',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
    newCustomerAlerts: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
  });

  const handleSaveStore = () => {
    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ إعدادات المتجر بنجاح',
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ إعدادات الإشعارات بنجاح',
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ إعدادات الأمان بنجاح',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            الإعدادات
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة إعدادات المتجر والنظام
          </p>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="store" className="gap-2">
              <Store className="h-4 w-4" />
              المتجر
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              الأمان
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              المظهر
            </TabsTrigger>
          </TabsList>

          {/* Store Settings */}
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المتجر</CardTitle>
                <CardDescription>
                  معلومات المتجر الأساسية والبيانات الضريبية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">اسم المتجر بالعربي</Label>
                    <Input
                      id="storeName"
                      value={storeSettings.storeName}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, storeName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeNameEn">اسم المتجر بالإنجليزي</Label>
                    <Input
                      id="storeNameEn"
                      value={storeSettings.storeNameEn}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, storeNameEn: e.target.value }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={storeSettings.email}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={storeSettings.phone}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">الرقم الضريبي</Label>
                    <Input
                      id="vatNumber"
                      value={storeSettings.vatNumber}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, vatNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatRate">نسبة ضريبة القيمة المضافة (%)</Label>
                    <Input
                      id="vatRate"
                      type="number"
                      value={storeSettings.vatRate}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, vatRate: e.target.value }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveStore} className="gap-2">
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
                <CardDescription>
                  تحكم في الإشعارات والتنبيهات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">إشعارات البريد الإلكتروني</p>
                    <p className="text-sm text-muted-foreground">استلام إشعارات عبر البريد</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">إشعارات الطلبات الجديدة</p>
                    <p className="text-sm text-muted-foreground">تنبيه عند استلام طلب جديد</p>
                  </div>
                  <Switch
                    checked={notificationSettings.orderNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, orderNotifications: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تنبيهات المخزون المنخفض</p>
                    <p className="text-sm text-muted-foreground">تنبيه عندما يكون المخزون منخفض</p>
                  </div>
                  <Switch
                    checked={notificationSettings.lowStockAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, lowStockAlerts: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تنبيهات العملاء الجدد</p>
                    <p className="text-sm text-muted-foreground">تنبيه عند تسجيل عميل جديد</p>
                  </div>
                  <Switch
                    checked={notificationSettings.newCustomerAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newCustomerAlerts: checked }))}
                  />
                </div>

                <Button onClick={handleSaveNotifications} className="gap-2">
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الأمان</CardTitle>
                <CardDescription>
                  إعدادات الحماية والوصول
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">المصادقة الثنائية</p>
                    <p className="text-sm text-muted-foreground">تفعيل المصادقة الثنائية لحماية إضافية</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">مهلة انتهاء الجلسة (دقيقة)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    className="w-32"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    سيتم تسجيل الخروج تلقائياً بعد فترة عدم النشاط
                  </p>
                </div>

                <Button onClick={handleSaveSecurity} className="gap-2">
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المظهر</CardTitle>
                <CardDescription>
                  تخصيص مظهر لوحة التحكم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  إعدادات المظهر قيد التطوير...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
