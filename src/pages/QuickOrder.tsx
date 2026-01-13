import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { QuickOrderGrid } from '@/components/search/QuickOrderGrid';

const QuickOrder: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">طلب سريع</h1>
          <p className="text-muted-foreground">
            ابحث عن القطع واختر عدة أصناف مع الكميات وأضفها للطلب
          </p>
        </div>
        
        <QuickOrderGrid />
      </div>
    </Layout>
  );
};

export default QuickOrder;
