import type { ReactNode } from 'react';
import { Card } from '../atoms/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  toolbar?: ReactNode;
  paginationInfo?: string;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
}

export function DataTable<T>({ 
  columns, 
  data, 
  toolbar, 
  paginationInfo,
  onPrevPage,
  onNextPage,
  disablePrev = true,
  disableNext = false
}: DataTableProps<T>) {
  return (
    <Card className="!p-0 flex flex-col flex-1 overflow-hidden">
      {}
      {toolbar && (
        <div className="p-4 sm:p-6 border-b border-outline-variant/50 bg-surface-container-low/30">
          {toolbar}
        </div>
      )}

      {}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 bg-surface-container-lowest shadow-[0_1px_0_0_var(--color-outline-variant)]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`py-4 px-6 font-label-md text-on-surface-variant text-[13px] uppercase tracking-wider ${col.headerClassName || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 bg-surface-container-lowest">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-body-sm text-outline-variant">
                  No hay datos disponibles.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer">
                  {columns.map((col) => (
                    <td key={`${col.key}-${i}`} className={`py-5 px-6 ${col.cellClassName || ''}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {}
      {(paginationInfo || onPrevPage || onNextPage) && (
        <div className="p-4 border-t border-outline-variant/50 flex justify-between items-center bg-surface-container-lowest">
          <p className="text-body-md text-on-surface-variant">{paginationInfo}</p>
          <div className="flex gap-2">
            <button 
              onClick={onPrevPage}
              disabled={disablePrev}
              className="p-2 border border-outline-variant rounded-lg text-outline hover:bg-surface-container-low transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={onNextPage}
              disabled={disableNext}
              className="p-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
