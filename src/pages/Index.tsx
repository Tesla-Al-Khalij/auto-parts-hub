import { Layout } from '@/components/layout/Layout';
import { QuickOrderGrid } from '@/components/search/QuickOrderGrid';
import { useCachedParts } from '@/hooks/useCachedParts';
import { CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { isFromCache, lastUpdated, refresh } = useCachedParts();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            طلب سريع
          </h1>
          <p className="text-muted-foreground text-lg">
            ادخل أرقام القطع والكميات مباشرة أو ارفع ملف Excel
          </p>
        </div>

        {/* Cache Status Indicator */}
        {isFromCache && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full">
              <CloudOff className="h-4 w-4" />
              <span>البيانات من الذاكرة المؤقتة</span>
              {lastUpdated && (
                <span className="text-amber-600 dark:text-amber-400">
                  ({lastUpdated.toLocaleDateString('ar-SA')})
                </span>
              )}
              {navigator.onLine && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800"
                  onClick={refresh}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Quick Order Grid */}
        <QuickOrderGrid />
      </div>
    </Layout>
  );
};

export default Index;
