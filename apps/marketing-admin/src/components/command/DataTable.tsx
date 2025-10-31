import React from 'react';
import { cn } from '@/lib/utils';

/**
 * DATA TABLE
 *
 * Command-style data table with neon accents and hover effects.
 * Optimized for analytics, logs, and content lists.
 */

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  className,
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  ...props
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn('panel-data', className)} {...props}>
        <div className="flex items-center justify-center py-12">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('panel-data', className)} {...props}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-text-tertiary text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)} {...props}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(row, index)}
              className={cn(
                onRowClick && 'cursor-pointer',
                'group'
              )}
            >
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render
                    ? column.render(row, index)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

DataTable.displayName = 'DataTable';

export default DataTable;
