import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from '@/lib/utils';
import { SortConfig, SortDirection } from '@/hooks/useTableControls';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
}: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t bg-muted/20">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>عرض</span>
        <Select value={pageSize.toString()} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>من أصل {totalItems}</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground ml-4">
          {startIndex + 1}-{endIndex} من {totalItems}
        </span>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1 px-2">
          <span className="text-sm font-medium">{currentPage}</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">{totalPages || 1}</span>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface SortableHeaderProps<T> {
  label: string;
  sortKey: keyof T;
  sortConfig: SortConfig<T>;
  onSort: (key: keyof T) => void;
  className?: string;
}

export function SortableHeader<T>({
  label,
  sortKey,
  sortConfig,
  onSort,
  className,
}: SortableHeaderProps<T>) {
  const isActive = sortConfig.key === sortKey;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-mx-2 h-8 gap-1 font-semibold hover:bg-transparent",
        isActive && "text-primary",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {isActive ? (
        sortConfig.direction === 'asc' ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
      )}
    </Button>
  );
}
