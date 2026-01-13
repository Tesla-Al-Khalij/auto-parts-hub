import { createContext, useContext, useState, ReactNode } from 'react';
import { Order } from '@/types';

interface DraftOrderContextType {
  draftOrder: Order | null;
  setDraftOrder: (order: Order | null) => void;
  clearDraftOrder: () => void;
}

const DraftOrderContext = createContext<DraftOrderContextType | undefined>(undefined);

export function DraftOrderProvider({ children }: { children: ReactNode }) {
  const [draftOrder, setDraftOrder] = useState<Order | null>(null);

  const clearDraftOrder = () => setDraftOrder(null);

  return (
    <DraftOrderContext.Provider value={{ draftOrder, setDraftOrder, clearDraftOrder }}>
      {children}
    </DraftOrderContext.Provider>
  );
}

export function useDraftOrder() {
  const context = useContext(DraftOrderContext);
  if (context === undefined) {
    throw new Error('useDraftOrder must be used within a DraftOrderProvider');
  }
  return context;
}
