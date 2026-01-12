import { ReactNode } from 'react';
import { Header } from './Header';
import { PullToRefresh } from './PullToRefresh';

interface LayoutProps {
  children: ReactNode;
  onRefresh?: () => void | Promise<void>;
}

export function Layout({ children, onRefresh }: LayoutProps) {
  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6 animate-fade-in">
          {children}
        </main>
      </div>
    </PullToRefresh>
  );
}
