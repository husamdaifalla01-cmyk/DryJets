'use client';

/**
 * OrderSummaryTable Component
 * Real-time order summary with calculations
 *
 * Features:
 * - Live calculation updates
 * - Editable quantities inline
 * - Remove item button
 * - Tax/discount calculations
 * - Responsive layout
 */

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderItem } from './OrderItemTile';

interface OrderLineItem {
  item: OrderItem;
  quantity: number;
}

interface OrderSummaryTableProps {
  items: OrderLineItem[];
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  taxRate?: number;
  discountAmount?: number;
}

export function OrderSummaryTable({
  items,
  onQuantityChange,
  onRemoveItem,
  taxRate = 0.08,
  discountAmount = 0,
}: OrderSummaryTableProps) {
  // Calculate totals
  const subtotal = items.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discountAmount;

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-sm">No items added yet</p>
        <p className="text-xs mt-1">Select items from the grid to add them</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Items List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {items.map(({ item, quantity }) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg',
              'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onQuantityChange(item.id, Math.max(0, quantity - 1))}
                  className={cn(
                    'h-6 w-6 rounded flex items-center justify-center',
                    'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600',
                    'text-gray-700 dark:text-gray-200 text-xs'
                  )}
                >
                  −
                </button>
                <span className="text-sm font-semibold text-gray-900 dark:text-white w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => onQuantityChange(item.id, quantity + 1)}
                  className={cn(
                    'h-6 w-6 rounded flex items-center justify-center',
                    'bg-primary-500 hover:bg-primary-600 text-white text-xs'
                  )}
                >
                  +
                </button>
              </div>

              {/* Price */}
              <div className="text-right min-w-[70px]">
                <p className="font-bold text-gray-900 dark:text-white">
                  ${(item.price * quantity).toFixed(2)}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={() => onRemoveItem(item.id)}
                className={cn(
                  'p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20',
                  'text-red-500 dark:text-red-400 transition-colors'
                )}
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tax ({(taxRate * 100).toFixed(0)}%)</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${tax.toFixed(2)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Discount</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              -${discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-gray-900 dark:text-white">Total</span>
          <span className="text-primary-600 dark:text-primary-400">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
