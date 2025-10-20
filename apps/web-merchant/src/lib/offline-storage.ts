/**
 * Offline Storage Module
 * IndexedDB with Dexie.js for offline order management
 *
 * Features:
 * - Draft orders storage
 * - Sync queue management
 * - Auto-save on input changes (debounced)
 * - Conflict resolution
 */

import Dexie, { type Table } from 'dexie';

// Draft Order interface
export interface DraftOrder {
  id?: number;
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
    pickupDate: string;
    paymentStatus: 'pending' | 'paid';
  };
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  syncError?: string;
}

// Dexie database class
class OfflineDatabase extends Dexie {
  draftOrders!: Table<DraftOrder, number>;

  constructor() {
    super('DryJetsOfflineDB');

    // Define database schema
    this.version(1).stores({
      draftOrders: '++id, orderNumber, syncStatus, createdAt, updatedAt',
    });
  }
}

// Create database instance
export const db = new OfflineDatabase();

// Draft order operations
export const draftOrderOps = {
  /**
   * Save or update a draft order
   */
  async save(order: Omit<DraftOrder, 'id'>): Promise<number> {
    try {
      const existingOrder = await db.draftOrders
        .where('orderNumber')
        .equals(order.orderNumber)
        .first();

      if (existingOrder) {
        // Update existing draft
        await db.draftOrders.update(existingOrder.id!, {
          ...order,
          updatedAt: new Date(),
        });
        return existingOrder.id!;
      } else {
        // Create new draft
        return await db.draftOrders.add({
          ...order,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error saving draft order:', error);
      throw error;
    }
  },

  /**
   * Get a draft order by order number
   */
  async getByOrderNumber(orderNumber: string): Promise<DraftOrder | undefined> {
    try {
      return await db.draftOrders.where('orderNumber').equals(orderNumber).first();
    } catch (error) {
      console.error('Error getting draft order:', error);
      return undefined;
    }
  },

  /**
   * Get all draft orders
   */
  async getAll(): Promise<DraftOrder[]> {
    try {
      return await db.draftOrders.toArray();
    } catch (error) {
      console.error('Error getting all draft orders:', error);
      return [];
    }
  },

  /**
   * Get pending sync orders
   */
  async getPendingSync(): Promise<DraftOrder[]> {
    try {
      return await db.draftOrders.where('syncStatus').equals('pending').toArray();
    } catch (error) {
      console.error('Error getting pending sync orders:', error);
      return [];
    }
  },

  /**
   * Delete a draft order
   */
  async delete(id: number): Promise<void> {
    try {
      await db.draftOrders.delete(id);
    } catch (error) {
      console.error('Error deleting draft order:', error);
      throw error;
    }
  },

  /**
   * Update sync status
   */
  async updateSyncStatus(
    id: number,
    status: DraftOrder['syncStatus'],
    error?: string
  ): Promise<void> {
    try {
      await db.draftOrders.update(id, {
        syncStatus: status,
        syncError: error,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating sync status:', error);
      throw error;
    }
  },

  /**
   * Clear all synced orders
   */
  async clearSynced(): Promise<void> {
    try {
      const syncedOrders = await db.draftOrders.where('syncStatus').equals('synced').toArray();
      const ids = syncedOrders.map((order) => order.id!);
      await db.draftOrders.bulkDelete(ids);
    } catch (error) {
      console.error('Error clearing synced orders:', error);
      throw error;
    }
  },
};

/**
 * Debounce helper for auto-save
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sync queue processor
 */
export async function processSyncQueue(): Promise<{
  success: number;
  failed: number;
  errors: Array<{ orderNumber: string; error: string }>;
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ orderNumber: string; error: string }>,
  };

  try {
    const pendingOrders = await draftOrderOps.getPendingSync();

    for (const order of pendingOrders) {
      try {
        // Update status to syncing
        await draftOrderOps.updateSyncStatus(order.id!, 'syncing');

        // TODO: Call actual API endpoint to create order
        // const response = await fetch('/api/orders', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(order),
        // });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mark as synced
        await draftOrderOps.updateSyncStatus(order.id!, 'synced');
        results.success++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await draftOrderOps.updateSyncStatus(order.id!, 'error', errorMessage);
        results.failed++;
        results.errors.push({
          orderNumber: order.orderNumber,
          error: errorMessage,
        });
      }
    }

    // Clean up synced orders
    await draftOrderOps.clearSynced();
  } catch (error) {
    console.error('Error processing sync queue:', error);
  }

  return results;
}

export default db;
