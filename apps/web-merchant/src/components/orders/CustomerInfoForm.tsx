'use client';

/**
 * CustomerInfoForm Component
 * Left panel form for customer details in Add Order flow
 *
 * Features:
 * - Customer name and phone
 * - Pickup date selection
 * - Auto-generated order number
 * - Payment status toggle
 */

import * as React from 'react';
import { Calendar, Phone, User, Hash, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerInfo {
  name: string;
  phone: string;
  pickupDate: string;
  orderNumber: string;
  paymentStatus: 'pending' | 'paid';
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (info: CustomerInfo) => void;
}

export function CustomerInfoForm({ customerInfo, onCustomerInfoChange }: CustomerInfoFormProps) {
  const handleChange = (field: keyof CustomerInfo, value: string) => {
    onCustomerInfoChange({
      ...customerInfo,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>

      {/* Customer Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <User className="h-4 w-4 inline mr-1" />
          Customer Name
        </label>
        <input
          type="text"
          value={customerInfo.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter customer name"
          className={cn(
            'w-full px-3 py-2 rounded-lg border',
            'bg-white dark:bg-gray-800',
            'border-gray-300 dark:border-gray-600',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors duration-150'
          )}
        />
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Phone className="h-4 w-4 inline mr-1" />
          Phone Number
        </label>
        <input
          type="tel"
          value={customerInfo.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="(555) 123-4567"
          className={cn(
            'w-full px-3 py-2 rounded-lg border',
            'bg-white dark:bg-gray-800',
            'border-gray-300 dark:border-gray-600',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors duration-150'
          )}
        />
      </div>

      {/* Pickup Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Calendar className="h-4 w-4 inline mr-1" />
          Pickup Date
        </label>
        <input
          type="date"
          value={customerInfo.pickupDate}
          onChange={(e) => handleChange('pickupDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={cn(
            'w-full px-3 py-2 rounded-lg border',
            'bg-white dark:bg-gray-800',
            'border-gray-300 dark:border-gray-600',
            'text-gray-900 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors duration-150'
          )}
        />
      </div>

      {/* Order Number (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Hash className="h-4 w-4 inline mr-1" />
          Order Number
        </label>
        <input
          type="text"
          value={customerInfo.orderNumber}
          readOnly
          className={cn(
            'w-full px-3 py-2 rounded-lg border',
            'bg-gray-100 dark:bg-gray-900',
            'border-gray-300 dark:border-gray-600',
            'text-gray-600 dark:text-gray-400',
            'cursor-not-allowed'
          )}
        />
      </div>

      {/* Payment Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <CreditCard className="h-4 w-4 inline mr-1" />
          Payment Status
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleChange('paymentStatus', 'pending')}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all',
              customerInfo.paymentStatus === 'pending'
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
            )}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => handleChange('paymentStatus', 'paid')}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all',
              customerInfo.paymentStatus === 'paid'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
            )}
          >
            Paid
          </button>
        </div>
      </div>
    </div>
  );
}
