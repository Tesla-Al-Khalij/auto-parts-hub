import { useState } from 'react';
import { User, Building2, Phone, Mail, MapPin, FileText, Save, Wallet } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { mockUserProfile } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { toast } = useToast();
  const [profile, setProfile] = useState(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);

  const creditUsagePercentage = (profile.balance / profile.creditLimit) * 100;

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: 'تم الحفظ',
      description: 'تم تحديث بيانات الحساب بنجاح',
    });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">حسابي</h1>
            <p className="text-muted-foreground">عرض وتعديل بيانات الحساب</p>
          </div>
        </div>

        {/* Credit summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <Wallet className="h-7 w-7 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">الرصيد المتاح</p>
                <p className="text-3xl font-bold text-success">
                  {profile.balance.toLocaleString('ar-SA')} ر.س
                </p>
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">الحد الائتماني</p>
                <p className="text-xl font-semibold">
                  {profile.creditLimit.toLocaleString('ar-SA')} ر.س
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">نسبة الاستخدام</span>
                <span className="font-medium">{creditUsagePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={creditUsagePercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Profile form */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>بيانات الشركة</CardTitle>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                تعديل
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  حفظ
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  اسم الشركة
                </Label>
                <Input
                  id="companyName"
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  disabled={!isEditing}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  اسم المسؤول
                </Label>
                <Input
                  id="contactName"
                  value={profile.contactName}
                  onChange={(e) => setProfile({ ...profile, contactName: e.target.value })}
                  disabled={!isEditing}
                  className="h-12"
                />
              </div>
            </div>

            <Separator />

            {/* Contact info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  رقم الجوال
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                  className="h-12"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                  className="h-12"
                  dir="ltr"
                />
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  العنوان
                </Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  disabled={!isEditing}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  disabled={!isEditing}
                  className="h-12"
                />
              </div>
            </div>

            <Separator />

            {/* Tax number */}
            <div className="space-y-2">
              <Label htmlFor="taxNumber" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                الرقم الضريبي
              </Label>
              <Input
                id="taxNumber"
                value={profile.taxNumber || ''}
                onChange={(e) => setProfile({ ...profile, taxNumber: e.target.value })}
                disabled={!isEditing}
                className="h-12 max-w-md"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
