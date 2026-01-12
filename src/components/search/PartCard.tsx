import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Part } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface PartCardProps {
  part: Part;
}

export function PartCard({ part }: PartCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(part, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuantity(1);
    }, 1500);
  };

  const inStock = part.stock > 0;
  const lowStock = part.stock > 0 && part.stock <= 10;

  return (
    <Card className={cn(
      'overflow-hidden transition-all hover:shadow-lg',
      added && 'ring-2 ring-success'
    )}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Part info */}
          <div className="flex-1 p-4 space-y-3">
            {/* Part number - prominent */}
            <div className="flex items-start justify-between gap-2">
              <code className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded">
                {part.partNumber}
              </code>
              <Badge variant="outline">{part.brand}</Badge>
            </div>

            {/* Name */}
            <h3 className="text-xl font-semibold text-foreground">
              {part.nameAr}
            </h3>

            {/* Price and stock */}
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-foreground">
                {part.price.toLocaleString('ar-SA')} <span className="text-base font-normal">ر.س</span>
              </div>
              
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                !inStock && 'bg-destructive/10 text-destructive',
                lowStock && 'bg-warning/10 text-warning',
                inStock && !lowStock && 'bg-success/10 text-success'
              )}>
                <Package className="h-4 w-4" />
                {!inStock ? 'غير متوفر' : `${part.stock} ${part.unit}`}
              </div>
            </div>
          </div>

          {/* Add to cart section */}
          <div className={cn(
            'flex flex-col items-center justify-center gap-3 p-4 bg-secondary/50 min-w-[180px]',
            !inStock && 'opacity-50 pointer-events-none'
          )}>
            {/* Quantity selector */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <Input
                type="number"
                min={1}
                max={part.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(part.stock, parseInt(e.target.value) || 1)))}
                className="w-20 h-12 text-center text-lg font-bold"
                dir="ltr"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={() => setQuantity(Math.min(part.stock, quantity + 1))}
                disabled={quantity >= part.stock}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Add button */}
            <Button
              size="lg"
              className={cn(
                'w-full h-14 text-lg gap-2 transition-all',
                added && 'bg-success hover:bg-success'
              )}
              onClick={handleAdd}
              disabled={!inStock || added}
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" />
                  تمت الإضافة
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  أضف للسلة
                </>
              )}
            </Button>

            {/* Subtotal */}
            <p className="text-sm text-muted-foreground">
              المجموع: <span className="font-bold text-foreground">{(part.price * quantity).toLocaleString('ar-SA')} ر.س</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
