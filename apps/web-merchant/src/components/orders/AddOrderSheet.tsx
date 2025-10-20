'use client';

/**
 * AddOrderSheet - Modern POS-inspired order creation flow
 *
 * Features:
 * - Grid-based item selection (4 cols desktop, responsive)
 * - Real-time order summary with calculations
 * - Draft saving to localStorage for offline support
 * - Optimistic UI updates
 * - Three-panel layout: Customer Info | Item Grid | Order Summary
 *
 * @example
 * <AddOrderSheet open={isOpen} onOpenChange={setIsOpen} />
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { X, Save, Trash2, CreditCard, Clock } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { OrderItemTile, type OrderItem } from './OrderItemTile';
import { OrderSummaryTable } from './OrderSummaryTable';
import { CustomerInfoForm } from './CustomerInfoForm';
import { cn } from '@/lib/utils';

// Mock service items data
const SERVICE_ITEMS: OrderItem[] = [
  { id: '1', name: 'Shirt', icon: '👔', price: 8.99, category: 'Clothing' },
  { id: '2', name: 'Dress', icon: '👗', price: 15.0, category: 'Clothing' },
  { id: '3', name: 'Jacket', icon: '🧥', price: 12.0, category: 'Outerwear' },
  { id: '4', name: 'Pants', icon: '👖', price: 10.0, category: 'Clothing' },
  { id: '5', name: 'Skirt', icon: '👘', price: 9.5, category: 'Clothing' },
  { id: '6', name: 'Suit', icon: '🎽', price: 25.0, category: 'Formal' },
  { id: '7', name: 'Bulk Load', icon: '🧺', price: 30.0, category: 'Bulk' },
  { id: '8', name: 'Custom', icon: '✨', price: 0, category: 'Special' },
];

interface AddOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddOrderSheet({ open, onOpenChange }: AddOrderSheetProps) {
  // Generate order number
  const [orderNumber] = React.useState(() => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}-${random}`;
  });

  // Customer info state
  const [customerInfo, setCustomerInfo] = React.useState({
    name: '',
    phone: '',
    pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    orderNumber,
    paymentStatus: 'pending' as 'pending' | 'paid',
  });

  // Order items state (itemId -> quantity)
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  // Handle quantity changes
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      const newQuantities = { ...quantities };
      delete newQuantities[itemId];
      setQuantities(newQuantities);
    } else {
      setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const newQuantities = { ...quantities };
    delete newQuantities[itemId];
    setQuantities(newQuantities);
  };

  // Get order line items for summary
  const orderLineItems = Object.entries(quantities).map(([itemId, quantity]) => ({
    item: SERVICE_ITEMS.find((item) => item.id === itemId)!,
    quantity,
  }));

  // Handle form actions
  const handleClear = () => {
    setQuantities({});
    setCustomerInfo({
      ...customerInfo,
      name: '',
      phone: '',
      paymentStatus: 'pending',
    });
  };

  const handleSaveDraft = () => {
    // Save to localStorage
    const draft = {
      customerInfo,
      quantities,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(`order-draft-${orderNumber}`, JSON.stringify(draft));
    console.log('Draft saved:', draft);
    // TODO: Show toast notification
  };

  const handleSubmitOrder = (payNow: boolean) => {
    const order = {
      ...customerInfo,
      items: orderLineItems,
      paymentStatus: payNow ? 'paid' : 'pending',
      createdAt: new Date().toISOString(),
    };
    console.log('Order submitted:', order);
    // TODO: Call API to create order
    // TODO: Show success notification
    // TODO: Close sheet and refresh orders list
    onOpenChange(false);
  };

  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const canSubmit = customerInfo.name && customerInfo.phone && totalItems > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-7xl p-0 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <SheetTitle className="text-xl font-bold">New Order</SheetTitle>
            <span className="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
              Draft
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-1" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Three-Panel Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel: Customer Info (30%) */}
          <div className="w-full sm:w-[30%] border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto custom-scrollbar">
            <CustomerInfoForm
              customerInfo={customerInfo}
              onCustomerInfoChange={setCustomerInfo}
            />
          </div>

          {/* Center Panel: Item Grid (45%) */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Select Services
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {SERVICE_ITEMS.map((item) => (
                <OrderItemTile
                  key={item.id}
                  item={item}
                  quantity={quantities[item.id] || 0}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          </div>

          {/* Right Panel: Order Summary (25%) */}
          <div className="w-full sm:w-[25%] border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h3>
            <OrderSummaryTable
              items={orderLineItems}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
            />
          </div>
        </div>

        {/* Footer: Action Buttons */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} • {orderNumber}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmitOrder(false)}
                disabled={!canSubmit}
              >
                <Clock className="h-4 w-4 mr-1" />
                Pay Later
              </Button>
              <Button
                onClick={() => handleSubmitOrder(true)}
                disabled={!canSubmit}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
