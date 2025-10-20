/**
 * DexieAdapter - IndexedDB storage for web applications
 *
 * Uses Dexie.js wrapper for IndexedDB with automatic sync capabilities
 */

import Dexie, { Table } from 'dexie';
import {
  StorageAdapter,
  StoredEntity,
  StorageMetadata,
  SyncStatus,
  SyncBatch,
  SyncResult,
  QueryOptions,
  SyncConfig,
  ConflictResolution,
  generateLocalId,
} from '../web';

/**
 * Dexie database schema
 */
class DryJetsDB extends Dexie {
  // Dynamic tables for each entity type
  [key: string]: any;

  constructor() {
    super('DryJetsDB');

    // Version 1 schema
    this.version(1).stores({
      // Metadata for sync tracking
      _syncMeta: '++id, entity, localId, serverId, syncStatus, updatedAt',

      // Core entities (add more as needed)
      orders: 'localId, serverId, syncStatus, createdAt, updatedAt',
      customers: 'localId, serverId, syncStatus, createdAt, updatedAt',
      services: 'localId, serverId, syncStatus, createdAt, updatedAt',
      equipment: 'localId, serverId, syncStatus, createdAt, updatedAt',
      drivers: 'localId, serverId, syncStatus, createdAt, updatedAt',
      merchants: 'localId, serverId, syncStatus, createdAt, updatedAt',
      maintenance: 'localId, serverId, syncStatus, createdAt, updatedAt',
      notifications: 'localId, serverId, syncStatus, createdAt, updatedAt',
    });
  }
}

/**
 * DexieAdapter implementation
 */
export class DexieAdapter implements StorageAdapter {
  private db: DryJetsDB;
  private syncHandler: ((batch: SyncBatch) => Promise<SyncResult[]>) | null = null;
  private config: Required<SyncConfig>;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(config?: SyncConfig) {
    this.db = new DryJetsDB();
    this.config = {
      autoSyncInterval: config?.autoSyncInterval ?? 30000, // 30 seconds
      batchSize: config?.batchSize ?? 50,
      maxRetries: config?.maxRetries ?? 3,
      retryBackoff: config?.retryBackoff ?? 2,
      conflictResolution: config?.conflictResolution ?? ConflictResolution.SERVER_WINS,
      debug: config?.debug ?? false,
    };
  }

  async init(): Promise<void> {
    await this.db.open();

    if (this.config.debug) {
      console.log('[DexieAdapter] Initialized with config:', this.config);
    }

    // Start auto-sync if configured
    if (this.config.autoSyncInterval > 0) {
      this.startAutoSync();
    }
  }

  async saveLocal<T>(entity: string, payload: T): Promise<string> {
    const localId = generateLocalId();
    const now = new Date();

    const metadata: StorageMetadata = {
      localId,
      serverId: null,
      syncStatus: SyncStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      lastSyncedAt: null,
      syncRetries: 0,
      syncError: null,
    };

    const storedEntity: StoredEntity<T> = {
      _meta: metadata,
      data: payload,
    };

    // Ensure table exists
    if (!this.db[entity]) {
      await this.createEntityTable(entity);
    }

    await this.db[entity].add(storedEntity);

    if (this.config.debug) {
      console.log(`[DexieAdapter] Saved ${entity} locally:`, localId);
    }

    // Trigger sync if handler is registered
    if (this.syncHandler) {
      this.triggerSync().catch((err) => {
        console.error('[DexieAdapter] Auto-sync failed:', err);
      });
    }

    return localId;
  }

  async updateLocal<T>(
    entity: string,
    localId: string,
    payload: Partial<T>
  ): Promise<StoredEntity<T>> {
    const existing = await this.getById<T>(entity, localId);

    if (!existing) {
      throw new Error(`Entity ${entity}:${localId} not found`);
    }

    const updated: StoredEntity<T> = {
      _meta: {
        ...existing._meta,
        updatedAt: new Date(),
        syncStatus: SyncStatus.PENDING, // Mark as pending again
      },
      data: {
        ...existing.data,
        ...payload,
      },
    };

    await this.db[entity].put(updated);

    if (this.config.debug) {
      console.log(`[DexieAdapter] Updated ${entity}:${localId}`);
    }

    return updated;
  }

  async deleteLocal(entity: string, localId: string): Promise<void> {
    await this.db[entity].where('_meta.localId').equals(localId).delete();

    if (this.config.debug) {
      console.log(`[DexieAdapter] Deleted ${entity}:${localId}`);
    }
  }

  async getById<T>(entity: string, localId: string): Promise<StoredEntity<T> | null> {
    const result = await this.db[entity]
      .where('_meta.localId')
      .equals(localId)
      .first();

    return result || null;
  }

  async getByServerId<T>(entity: string, serverId: string): Promise<StoredEntity<T> | null> {
    const result = await this.db[entity]
      .where('_meta.serverId')
      .equals(serverId)
      .first();

    return result || null;
  }

  async list<T>(entity: string, options?: QueryOptions): Promise<StoredEntity<T>[]> {
    let query = this.db[entity].toCollection();

    // Filter by sync status
    if (options?.syncStatus) {
      const statuses = Array.isArray(options.syncStatus)
        ? options.syncStatus
        : [options.syncStatus];
      query = query.filter((item: StoredEntity<T>) =>
        statuses.includes(item._meta.syncStatus)
      );
    }

    // Date range filter
    if (options?.dateRange) {
      const { field, from, to } = options.dateRange;
      query = query.filter((item: StoredEntity<T>) => {
        const value = (item._meta as any)[field];
        if (!value) return false;
        const date = new Date(value);
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
      });
    }

    // Sorting
    if (options?.sortBy) {
      const direction = options.sortDirection === 'desc' ? -1 : 1;
      query = query.sortBy(`_meta.${options.sortBy}`);
    }

    // Pagination
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return await query.toArray();
  }

  async listPending<T>(entity: string): Promise<StoredEntity<T>[]> {
    return await this.db[entity]
      .where('_meta.syncStatus')
      .equals(SyncStatus.PENDING)
      .toArray();
  }

  async markSynced(entity: string, localId: string, serverId: string): Promise<void> {
    await this.db[entity]
      .where('_meta.localId')
      .equals(localId)
      .modify((item: StoredEntity) => {
        item._meta.serverId = serverId;
        item._meta.syncStatus = SyncStatus.SYNCED;
        item._meta.lastSyncedAt = new Date();
        item._meta.syncError = null;
        item._meta.syncRetries = 0;
      });

    if (this.config.debug) {
      console.log(`[DexieAdapter] Marked ${entity}:${localId} as synced (server ID: ${serverId})`);
    }
  }

  async markSyncFailed(entity: string, localId: string, error: string): Promise<void> {
    await this.db[entity]
      .where('_meta.localId')
      .equals(localId)
      .modify((item: StoredEntity) => {
        item._meta.syncStatus = SyncStatus.FAILED;
        item._meta.syncError = error;
        item._meta.syncRetries += 1;
      });

    if (this.config.debug) {
      console.error(`[DexieAdapter] Sync failed for ${entity}:${localId}:`, error);
    }
  }

  async getPendingCount(): Promise<number> {
    const entityTypes = ['orders', 'customers', 'services', 'equipment', 'drivers', 'merchants', 'maintenance', 'notifications'];
    let total = 0;

    for (const entity of entityTypes) {
      const count = await this.db[entity]
        .where('_meta.syncStatus')
        .equals(SyncStatus.PENDING)
        .count();
      total += count;
    }

    return total;
  }

  async getPendingCountForEntity(entity: string): Promise<number> {
    return await this.db[entity]
      .where('_meta.syncStatus')
      .equals(SyncStatus.PENDING)
      .count();
  }

  onSync(handler: (batch: SyncBatch) => Promise<SyncResult[]>): void {
    this.syncHandler = handler;

    if (this.config.debug) {
      console.log('[DexieAdapter] Sync handler registered');
    }
  }

  async triggerSync(): Promise<SyncResult[]> {
    if (!this.syncHandler) {
      throw new Error('No sync handler registered. Call onSync() first.');
    }

    const entityTypes = ['orders', 'customers', 'services', 'equipment', 'drivers', 'merchants', 'maintenance', 'notifications'];
    const allResults: SyncResult[] = [];

    for (const entity of entityTypes) {
      const pending = await this.listPending(entity);

      if (pending.length === 0) continue;

      // Filter items that haven't exceeded max retries
      const syncable = pending.filter(
        (item) => item._meta.syncRetries < this.config.maxRetries
      );

      if (syncable.length === 0) continue;

      // Batch items
      for (let i = 0; i < syncable.length; i += this.config.batchSize) {
        const batch: SyncBatch = {
          entity,
          items: syncable.slice(i, i + this.config.batchSize),
        };

        if (this.config.debug) {
          console.log(`[DexieAdapter] Syncing batch of ${batch.items.length} ${entity}...`);
        }

        try {
          // Mark as syncing
          for (const item of batch.items) {
            await this.db[entity]
              .where('_meta.localId')
              .equals(item._meta.localId)
              .modify((i: StoredEntity) => {
                i._meta.syncStatus = SyncStatus.SYNCING;
              });
          }

          // Call sync handler
          const results = await this.syncHandler(batch);
          allResults.push(...results);

          // Update sync status based on results
          for (const result of results) {
            if (result.success && result.serverId) {
              await this.markSynced(entity, result.localId, result.serverId);
            } else {
              await this.markSyncFailed(entity, result.localId, result.error || 'Unknown error');
            }
          }
        } catch (error) {
          // Batch failed - mark all as failed
          for (const item of batch.items) {
            await this.markSyncFailed(
              entity,
              item._meta.localId,
              error instanceof Error ? error.message : 'Sync failed'
            );
          }
        }
      }
    }

    if (this.config.debug) {
      console.log(`[DexieAdapter] Sync complete. Results:`, allResults);
    }

    return allResults;
  }

  async clearAll(): Promise<void> {
    await this.db.delete();
    await this.db.open();

    if (this.config.debug) {
      console.log('[DexieAdapter] All data cleared');
    }
  }

  async exportData(): Promise<string> {
    const entityTypes = ['orders', 'customers', 'services', 'equipment', 'drivers', 'merchants', 'maintenance', 'notifications'];
    const exportData: Record<string, any[]> = {};

    for (const entity of entityTypes) {
      exportData[entity] = await this.db[entity].toArray();
    }

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    for (const [entity, items] of Object.entries(data)) {
      if (!this.db[entity]) {
        await this.createEntityTable(entity);
      }

      await this.db[entity].bulkPut(items as any[]);
    }

    if (this.config.debug) {
      console.log('[DexieAdapter] Data imported successfully');
    }
  }

  /**
   * Private helper to create a new entity table dynamically
   */
  private async createEntityTable(entity: string): Promise<void> {
    const currentVersion = this.db.verno;
    this.db.close();

    this.db.version(currentVersion + 1).stores({
      [entity]: 'localId, serverId, syncStatus, createdAt, updatedAt',
    });

    await this.db.open();

    if (this.config.debug) {
      console.log(`[DexieAdapter] Created table for entity: ${entity}`);
    }
  }

  /**
   * Start automatic sync on interval
   */
  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (!this.syncHandler) return;

      const pendingCount = await this.getPendingCount();
      if (pendingCount === 0) return;

      if (this.config.debug) {
        console.log(`[DexieAdapter] Auto-sync triggered (${pendingCount} items pending)`);
      }

      try {
        await this.triggerSync();
      } catch (error) {
        console.error('[DexieAdapter] Auto-sync error:', error);
      }
    }, this.config.autoSyncInterval);

    if (this.config.debug) {
      console.log(
        `[DexieAdapter] Auto-sync started (interval: ${this.config.autoSyncInterval}ms)`
      );
    }
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;

      if (this.config.debug) {
        console.log('[DexieAdapter] Auto-sync stopped');
      }
    }
  }
}