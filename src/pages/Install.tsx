import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Check, Share, Plus, MoreVertical } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 mb-6">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">التطبيق مثبت!</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            تم تثبيت التطبيق على جهازك. يمكنك الوصول إليه من الشاشة الرئيسية.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Smartphone className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            تثبيت التطبيق
          </h1>
          <p className="text-muted-foreground text-lg">
            أضف التطبيق إلى شاشتك الرئيسية للوصول السريع
          </p>
        </div>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>مميزات التثبيت</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                'وصول سريع من الشاشة الرئيسية',
                'يعمل بدون اتصال بالإنترنت',
                'تجربة كتطبيق أصلي',
                'إشعارات فورية (قريباً)',
                'تحميل أسرع',
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Install Button or Instructions */}
        {deferredPrompt ? (
          <Button
            size="lg"
            className="w-full h-16 text-xl gap-3"
            onClick={handleInstall}
          >
            <Download className="h-6 w-6" />
            تثبيت التطبيق الآن
          </Button>
        ) : isIOS ? (
          <Card>
            <CardHeader>
              <CardTitle>كيفية التثبيت على iPhone</CardTitle>
              <CardDescription>اتبع الخطوات التالية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium">اضغط على زر المشاركة</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Share className="h-4 w-4" /> في شريط Safari السفلي
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium">اختر "إضافة إلى الشاشة الرئيسية"</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Add to Home Screen
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium">اضغط "إضافة"</p>
                  <p className="text-sm text-muted-foreground">
                    سيظهر التطبيق على شاشتك الرئيسية
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>كيفية التثبيت على Android</CardTitle>
              <CardDescription>اتبع الخطوات التالية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium">اضغط على قائمة المتصفح</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MoreVertical className="h-4 w-4" /> النقاط الثلاث في الأعلى
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium">اختر "تثبيت التطبيق"</p>
                  <p className="text-sm text-muted-foreground">
                    أو "إضافة إلى الشاشة الرئيسية"
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium">اضغط "تثبيت"</p>
                  <p className="text-sm text-muted-foreground">
                    سيظهر التطبيق على شاشتك الرئيسية
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
