'use client';

/**
 * OrderItemTile Component
 * POS-style item selection tile with visible price and quick quantity controls
 *
 * Features:
 * - One-tap item selection with icon
 * - Visible price on tile for cashier speed
 * - Quick +/- quantity buttons
 * - Hover and tap animations with Framer Motion
 * - Responsive grid layout
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OrderItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  category: string;
}

interface OrderItemTileProps {
  item: OrderItem;
  quantity: number;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
}

export function OrderItemTile({ item, quantity, onQuantityChange }: OrderItemTileProps) {
  const handleIncrement = () => {
    onQuantityChange(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(item.id, quantity - 1);
    }
  };

  const handleTileClick = () => {
    if (quantity === 0) {
      onQuantityChange(item.id, 1);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      onClick={handleTileClick}
      className={cn(
        'relative rounded-xl p-4 border-2 cursor-pointer transition-all duration-150',
        quantity > 0
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
      )}
    >
      {/* Item Icon */}
      <div className="text-4xl mb-2 text-center">{item.icon}</div>

      {/* Item Name */}
      <div className="font-semibold text-center text-sm text-gray-900 dark:text-white mb-1">
        {item.name}
      </div>

      {/* Price */}
      <div className="text-center text-primary-600 dark:text-primary-400 font-bold text-lg mb-3">
        ${item.price.toFixed(2)}
      </div>

      {/* Quantity Controls */}
      {quantity > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDecrement}
            className={cn(
              'h-7 w-7 rounded-md flex items-center justify-center',
              'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600',
              'text-gray-700 dark:text-gray-200 transition-colors'
            )}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-lg font-bold text-gray-900 dark:text-white w-8 text-center">
            {quantity}
          </span>
          <button
            onClick={handleIncrement}
            className={cn(
              'h-7 w-7 rounded-md flex items-center justify-center',
              'bg-primary-500 hover:bg-primary-600 text-white transition-colors'
            )}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Category Badge */}
      <div className="absolute top-2 right-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {item.category}
        </span>
      </div>

      {/* Selection Indicator */}
      {quantity > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 left-2 h-3 w-3 rounded-full bg-primary-500"
        />
      )}
    </motion.div>
  );
}
