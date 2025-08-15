import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Trash2, Edit2, Eye } from 'lucide-react';
import Button from './Button';
import Card from './Card';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  title?: string;
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
  };
  actions?: {
    view?: (item: T) => void;
    edit?: (item: T) => void;
    delete?: (item: T) => void;
    custom?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: (item: T) => void;
      color?: string;
    }>;
  };
  onRowClick?: (item: T) => void; // New prop for row click
  filters?: React.ReactNode;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  emptyMessage?: string;
}

function DataTable<T>({
  data = [],
  columns,
  keyField,
  title,
  isLoading = false,
  pagination,
  actions,
  onRowClick,
  filters,
  searchPlaceholder = "Rechercher...",
  onSearch,
  emptyMessage = "Aucune donnée disponible"
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearch]);

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { page, limit, total, onPageChange, onLimitChange } = pagination;
    const totalPages = Math.ceil(total / limit);
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Affichage de {total > 0 ? startItem : 0} à {endItem} sur {total} éléments
        </div>
        <div className="flex items-center space-x-2">
          {onLimitChange && (
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Page {page} sur {totalPages || 1}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      {/* Header with search and filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {onSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full md:w-64"
                />
              </div>
            )}
            
            {filters && (
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                {filters}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      typeof column.accessor === 'string' && column.sortable
                        ? 'cursor-pointer hover:bg-gray-100'
                        : ''
                    }`}
                    onClick={() => {
                      if (typeof column.accessor === 'string' && column.sortable) {
                        handleSort(column.accessor);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {typeof column.accessor === 'string' && column.sortable && sortField === column.accessor && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-bleu divide-y divide-gray-200">
              {data.map((item) => (
                <tr 
                  key={String(item[keyField])} 
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      {column.cell
                        ? column.cell(item)
                        : typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : String(item[column.accessor] || '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {actions.view && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => actions.view!(item)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {actions.edit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => actions.edit!(item)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {actions.delete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => actions.delete!(item)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                        {actions.custom && actions.custom.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant="ghost"
                            size="sm"
                            onClick={() => action.onClick(item)}
                            className={action.color}
                          >
                            {action.icon}
                            {action.label && <span className="ml-1">{action.label}</span>}
                          </Button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </Card>
  );
}

export default DataTable;