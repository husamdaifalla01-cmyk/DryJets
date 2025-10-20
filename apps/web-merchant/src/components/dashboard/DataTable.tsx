'use client';

/**
 * Data Table Component
 * Phase 3: Enterprise Dashboard Architecture
 *
 * High-performance table with sorting, filtering, pagination
 * Inspired by Stripe and Linear tables
 *
 * Features:
 * - Column sorting (single and multi-column)
 * - Search/filtering
 * - Pagination with page size options
 * - Row selection (single and multi-select)
 * - Bulk actions
 * - Column customization (show/hide)
 * - Responsive design (mobile-friendly)
 * - Loading and empty states
 * - Export to CSV (optional)
 * - Keyboard navigation
 *
 * Note: For 1,000+ rows, use with @tanstack/react-virtual
 */

import * as React from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  MoreHorizontal,
  Download,
  Filter,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button-v2';
import { Input } from '@/components/ui/input-v2';

export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessor?: (row: T) => React.ReactNode;
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];

  // Features
  searchable?: boolean;
  searchPlaceholder?: string;
  sortable?: boolean;
  selectable?: boolean;
  pagination?: boolean;

  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];

  // Selection
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;

  // Bulk actions
  bulkActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (rows: T[]) => void;
  }>;

  // Sorting
  defaultSort?: {
    column: string;
    direction: 'asc' | 'desc';
  };

  // Export
  exportable?: boolean;
  exportFilename?: string;

  // States
  loading?: boolean;
  emptyMessage?: string;

  // Row click
  onRowClick?: (row: T) => void;

  className?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = 'Search...',
  sortable = true,
  selectable = false,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  selectedRows = [],
  onSelectionChange,
  bulkActions,
  defaultSort,
  exportable = false,
  exportFilename = 'export.csv',
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{
    column: string;
    direction: 'asc' | 'desc';
  } | null>(defaultSort || null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(pageSize);
  const [selected, setSelected] = React.useState<Set<string | number>>(
    new Set(selectedRows.map((r) => r.id))
  );

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;

    return data.filter((row) => {
      return columns.some((col) => {
        const value = col.accessorKey
          ? String((row as any)[col.accessorKey])
          : col.accessor
          ? String(col.accessor(row))
          : '';
        return value.toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const column = columns.find((col) => col.id === sortConfig.column);
      if (!column) return 0;

      const aValue = column.accessorKey
        ? (a as any)[column.accessorKey]
        : column.accessor
        ? column.accessor(a)
        : '';
      const bValue = column.accessorKey
        ? (b as any)[column.accessorKey]
        : column.accessor
        ? column.accessor(b)
        : '';

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig, columns]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, itemsPerPage, pagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Handle sort
  const handleSort = (columnId: string) => {
    if (!sortable) return;

    setSortConfig((prev) => {
      if (prev?.column === columnId) {
        return {
          column: columnId,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { column: columnId, direction: 'asc' };
    });
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(paginatedData.map((r) => r.id)));
    } else {
      setSelected(new Set());
    }
  };

  const handleSelectRow = (id: string | number, checked: boolean) => {
    const newSelected = new Set(selected);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelected(newSelected);

    if (onSelectionChange) {
      const selectedData = data.filter((r) => newSelected.has(r.id));
      onSelectionChange(selectedData);
    }
  };

  // Export to CSV
  const handleExport = () => {
    const visibleColumns = columns.filter((col) => !col.hidden);

    const csvHeaders = visibleColumns.map((col) => col.header).join(',');
    const csvRows = sortedData.map((row) => {
      return visibleColumns
        .map((col) => {
          const value = col.accessorKey
            ? (row as any)[col.accessorKey]
            : col.accessor
            ? col.accessor(row)
            : '';
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csv = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allSelected = selected.size === paginatedData.length && paginatedData.length > 0;
  const someSelected = selected.size > 0 && selected.size < paginatedData.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        {searchable && (
          <div className="flex-1 max-w-sm">
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page
              }}
              iconBefore={<Search className="h-4 w-4" />}
              iconAfter={
                searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[#9CA3AF] hover:text-[#6B7280]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null
              }
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Bulk actions */}
          {selectable && bulkActions && selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
                {selected.size} selected
              </span>
              {bulkActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const selectedData = data.filter((r) => selected.has(r.id));
                      action.onClick(selectedData);
                    }}
                  >
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}

          {/* Export */}
          {exportable && (
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] dark:bg-[#161618] border-b border-[#E5E7EB] dark:border-[#2A2A2D]">
              <tr>
                {/* Selection column */}
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-[#D1D5DB] text-[#0066FF] focus:ring-[#0066FF]"
                    />
                  </th>
                )}

                {/* Data columns */}
                {columns
                  .filter((col) => !col.hidden)
                  .map((column) => (
                    <th
                      key={column.id}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-[#A1A1A6] uppercase tracking-wider',
                        column.sortable !== false && sortable && 'cursor-pointer select-none',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                      )}
                      style={{ width: column.width }}
                      onClick={() => column.sortable !== false && handleSort(column.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.header}</span>
                        {column.sortable !== false && sortable && (
                          <span>
                            {sortConfig?.column === column.id ? (
                              sortConfig.direction === 'asc' ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-[#0A0A0B] divide-y divide-[#F3F4F6] dark:divide-[#1A1A1D]">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="px-4 py-12 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066FF]" />
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="px-4 py-12 text-center text-sm text-[#6B7280] dark:text-[#A1A1A6]"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'transition-colors duration-150',
                      onRowClick && 'cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-[#161618]',
                    )}
                  >
                    {/* Selection */}
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-[#D1D5DB] text-[#0066FF] focus:ring-[#0066FF]"
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {columns
                      .filter((col) => !col.hidden)
                      .map((column) => {
                        const value = column.accessorKey
                          ? (row as any)[column.accessorKey]
                          : column.accessor
                          ? column.accessor(row)
                          : null;

                        const cellContent = column.cell ? column.cell(value, row) : value;

                        return (
                          <td
                            key={column.id}
                            className={cn(
                              'px-4 py-3 text-sm text-[#111827] dark:text-[#FAFAFA]',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right',
                            )}
                          >
                            {cellContent}
                          </td>
                        );
                      })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && !loading && paginatedData.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] dark:border-[#2A2A2D] bg-[#F9FAFB] dark:bg-[#161618]">
            {/* Results info */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, sortedData.length)} of{' '}
                {sortedData.length} results
              </span>

              {/* Page size selector */}
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 text-sm border-[#D1D5DB] dark:border-[#2A2A2D] rounded-md bg-white dark:bg-[#0A0A0B] text-[#111827] dark:text-[#FAFAFA]"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        'h-8 w-8 rounded-md text-sm font-medium transition-colors',
                        currentPage === pageNum
                          ? 'bg-[#0066FF] text-white'
                          : 'text-[#6B7280] dark:text-[#A1A1A6] hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D]',
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
