/**
 * SqliteAdapter - SQLite storage for desktop applications
 *
 * Uses better-sqlite3 for fast, synchronous SQLite operations
 */

import Database from 'better-sqlite3';
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
} from '../index';
import * as path from 'path';
import * as fs from 'fs';

/**
 * SqliteAdapter implementation
 */
export class SqliteAdapter implements StorageAdapter {
  private db: Database.Database | null = null;
  private syncHandler: ((batch: SyncBatch) => Promise<SyncResult[]>) | null = null;
  private config: Required<SyncConfig>;
  private syncInterval: NodeJS.Timeout | null = null;
  private dbPath: string;

  constructor(config?: SyncConfig, dbPath?: string) {
    this.config = {
      autoSyncInterval: config?.autoSyncInterval ?? 30000,
      batchSize: config?.batchSize ?? 50,
      maxRetries: config?.maxRetries ?? 3,
      retryBackoff: config?.retryBackoff ?? 2,
      conflictResolution: config?.conflictResolution ?? ConflictResolution.SERVER_WINS,
      debug: config?.debug ?? false,
    };

    // Default database path (user data directory)
    this.dbPath = dbPath || path.join(process.env.HOME || '', '.dryjets', 'dryjets.db');
  }

  async init(): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Open database
    this.db = new Database(this.dbPath);

    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');

    // Create base schema
    this.createSchema();

    if (this.config.debug) {
      console.log('[SqliteAdapter] Initialized at:', this.dbPath);
      console.log('[SqliteAdapter] Config:', this.config);
    }

    // Start auto-sync if configured
    if (this.config.autoSyncInterval > 0) {
      this.startAutoSync();
    }
  }

  async saveLocal<T>(entity: string, payload: T): Promise<string> {
    this.ensureDb();

    const localId = generateLocalId();
    const now = new Date().toISOString();

    const metadata: StorageMetadata = {
      localId,
      serverId: null,
      syncStatus: SyncStatus.PENDING,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      lastSyncedAt: null,
      syncRetries: 0,
      syncError: null,
    };

    const storedEntity: StoredEntity<T> = {
      _meta: metadata,
      data: payload,
    };

    // Ensure table exists
    this.ensureEntityTable(entity);

    // Insert into database
    const stmt = this.db!.prepare(`
      INSERT INTO ${entity} (localId, serverId, syncStatus, createdAt, updatedAt, lastSyncedAt, syncRetries, syncError, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      localId,
      null,
      SyncStatus.PENDING,
      now,
      now,
      null,
      0,
      null,
      JSON.stringify(payload)
    );

    if (this.config.debug) {
      console.log(`[SqliteAdapter] Saved ${entity} locally:`, localId);
    }

    // Trigger sync if handler is registered
    if (this.syncHandler) {
      this.triggerSync().catch((err) => {
        console.error('[SqliteAdapter] Auto-sync failed:', err);
      });
    }

    return localId;
  }

  async updateLocal<T>(
    entity: string,
    localId: string,
    payload: Partial<T>
  ): Promise<StoredEntity<T>> {
    this.ensureDb();

    const existing = await this.getById<T>(entity, localId);

    if (!existing) {
      throw new Error(`Entity ${entity}:${localId} not found`);
    }

    const updatedData = {
      ...existing.data,
      ...payload,
    };

    const now = new Date().toISOString();

    const stmt = this.db!.prepare(`
      UPDATE ${entity}
      SET data = ?, updatedAt = ?, syncStatus = ?
      WHERE localId = ?
    `);

    stmt.run(JSON.stringify(updatedData), now, SyncStatus.PENDING, localId);

    if (this.config.debug) {
      console.log(`[SqliteAdapter] Updated ${entity}:${localId}`);
    }

    return {
      _meta: {
        ...existing._meta,
        updatedAt: new Date(now),
        syncStatus: SyncStatus.PENDING,
      },
      data: updatedData,
    };
  }

  async deleteLocal(entity: string, localId: string): Promise<void> {
    this.ensureDb();

    const stmt = this.db!.prepare(`DELETE FROM ${entity} WHERE localId = ?`);
    stmt.run(localId);

    if (this.config.debug) {
      console.log(`[SqliteAdapter] Deleted ${entity}:${localId}`);
    }
  }

  async getById<T>(entity: string, localId: string): Promise<StoredEntity<T> | null> {
    this.ensureDb();

    const stmt = this.db!.prepare(`SELECT * FROM ${entity} WHERE localId = ?`);
    const row = stmt.get(localId) as any;

    if (!row) return null;

    return this.rowToEntity<T>(row);
  }

  async getByServerId<T>(entity: string, serverId: string): Promise<StoredEntity<T> | null> {
    this.ensureDb();

    const stmt = this.db!.prepare(`SELECT * FROM ${entity} WHERE serverId = ?`);
    const row = stmt.get(serverId) as any;

    if (!row) return null;

    return this.rowToEntity<T>(row);
  }

  async list<T>(entity: string, options?: QueryOptions): Promise<StoredEntity<T>[]> {
    this.ensureDb();

    let query = `SELECT * FROM ${entity} WHERE 1=1`;
    const params: any[] = [];

    // Filter by sync status
    if (options?.syncStatus) {
      const statuses = Array.isArray(options.syncStatus)
        ? options.syncStatus
        : [options.syncStatus];
      query += ` AND syncStatus IN (${statuses.map(() => '?').join(',')})`;
      params.push(...statuses);
    }

    // Date range filter
    if (options?.dateRange) {
      const { field, from, to } = options.dateRange;
      if (from) {
        query += ` AND ${field} >= ?`;
        params.push(from.toISOString());
      }
      if (to) {
        query += ` AND ${field} <= ?`;
        params.push(to.toISOString());
      }
    }

    // Sorting
    if (options?.sortBy) {
      const direction = options.sortDirection === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${options.sortBy} ${direction}`;
    } else {
      query += ` ORDER BY createdAt DESC`;
    }

    // Pagination
    if (options?.limit) {
      query += ` LIMIT ?`;
      params.push(options.limit);
    }
    if (options?.offset) {
      query += ` OFFSET ?`;
      params.push(options.offset);
    }

    const stmt = this.db!.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map((row) => this.rowToEntity<T>(row));
  }

  async listPending<T>(entity: string): Promise<StoredEntity<T>[]> {
    this.ensureDb();

    const stmt = this.db!.prepare(`SELECT * FROM ${entity} WHERE syncStatus = ?`);
    const rows = stmt.all(SyncStatus.PENDING) as any[];

    return rows.map((row) => this.rowToEntity<T>(row));
  }

  async markSynced(entity: string, localId: string, serverId: string): Promise<void> {
    this.ensureDb();

    const now = new Date().toISOString();

    const stmt = this.db!.prepare(`
      UPDATE ${entity}
      SET serverId = ?, syncStatus = ?, lastSyncedAt = ?, syncError = NULL, syncRetries = 0
      WHERE localId = ?
    `);

    stmt.run(serverId, SyncStatus.SYNCED, now, localId);

    if (this.config.debug) {
      console.log(`[SqliteAdapter] Marked ${entity}:${localId} as synced (server ID: ${serverId})`);
    }
  }

  async markSyncFailed(entity: string, localId: string, error: string): Promise<void> {
    this.ensureDb();

    const stmt = this.db!.prepare(`
      UPDATE ${entity}
      SET syncStatus = ?, syncError = ?, syncRetries = syncRetries + 1
      WHERE localId = ?
    `);

    stmt.run(SyncStatus.FAILED, error, localId);

    if (this.config.debug) {
      console.error(`[SqliteAdapter] Sync failed for ${entity}:${localId}:`, error);
    }
  }

  async getPendingCount(): Promise<number> {
    this.ensureDb();

    const entityTypes = this.getEntityTables();
    let total = 0;

    for (const entity of entityTypes) {
      const stmt = this.db!.prepare(`SELECT COUNT(*) as count FROM ${entity} WHERE syncStatus = ?`);
      const result = stmt.get(SyncStatus.PENDING) as any;
      total += result.count;
    }

    return total;
  }

  async getPendingCountForEntity(entity: string): Promise<number> {
    this.ensureDb();

    const stmt = this.db!.prepare(`SELECT COUNT(*) as count FROM ${entity} WHERE syncStatus = ?`);
    const result = stmt.get(SyncStatus.PENDING) as any;

    return result.count;
  }

  onSync(handler: (batch: SyncBatch) => Promise<SyncResult[]>): void {
    this.syncHandler = handler;

    if (this.config.debug) {
      console.log('[SqliteAdapter] Sync handler registered');
    }
  }

  async triggerSync(): Promise<SyncResult[]> {
    if (!this.syncHandler) {
      throw new Error('No sync handler registered. Call onSync() first.');
    }

    this.ensureDb();

    const entityTypes = this.getEntityTables();
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
          console.log(`[SqliteAdapter] Syncing batch of ${batch.items.length} ${entity}...`);
        }

        try {
          // Mark as syncing
          const stmt = this.db!.prepare(`UPDATE ${entity} SET syncStatus = ? WHERE localId = ?`);
          for (const item of batch.items) {
            stmt.run(SyncStatus.SYNCING, item._meta.localId);
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
      console.log(`[SqliteAdapter] Sync complete. Results:`, allResults);
    }

    return allResults;
  }

  async clearAll(): Promise<void> {
    this.ensureDb();

    const tables = this.getEntityTables();

    for (const table of tables) {
      this.db!.prepare(`DELETE FROM ${table}`).run();
    }

    if (this.config.debug) {
      console.log('[SqliteAdapter] All data cleared');
    }
  }

  async exportData(): Promise<string> {
    this.ensureDb();

    const entityTypes = this.getEntityTables();
    const exportData: Record<string, any[]> = {};

    for (const entity of entityTypes) {
      const items = await this.list(entity);
      exportData[entity] = items;
    }

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    this.ensureDb();

    const data = JSON.parse(jsonData);

    for (const [entity, items] of Object.entries(data)) {
      this.ensureEntityTable(entity);

      for (const item of items as StoredEntity[]) {
        const stmt = this.db!.prepare(`
          INSERT OR REPLACE INTO ${entity}
          (localId, serverId, syncStatus, createdAt, updatedAt, lastSyncedAt, syncRetries, syncError, data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          item._meta.localId,
          item._meta.serverId,
          item._meta.syncStatus,
          item._meta.createdAt.toISOString(),
          item._meta.updatedAt.toISOString(),
          item._meta.lastSyncedAt?.toISOString() || null,
          item._meta.syncRetries,
          item._meta.syncError,
          JSON.stringify(item.data)
        );
      }
    }

    if (this.config.debug) {
      console.log('[SqliteAdapter] Data imported successfully');
    }
  }

  /**
   * Private: Ensure database is initialized
   */
  private ensureDb(): void {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
  }

  /**
   * Private: Create base schema
   */
  private createSchema(): void {
    this.ensureDb();

    // Create default entity tables
    const entities = [
      'orders',
      'customers',
      'services',
      'equipment',
      'drivers',
      'merchants',
      'maintenance',
      'notifications',
    ];

    for (const entity of entities) {
      this.ensureEntityTable(entity);
    }
  }

  /**
   * Private: Ensure entity table exists
   */
  private ensureEntityTable(entity: string): void {
    this.ensureDb();

    this.db!.exec(`
      CREATE TABLE IF NOT EXISTS ${entity} (
        localId TEXT PRIMARY KEY,
        serverId TEXT,
        syncStatus TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        lastSyncedAt TEXT,
        syncRetries INTEGER NOT NULL DEFAULT 0,
        syncError TEXT,
        data TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_${entity}_serverId ON ${entity}(serverId);
      CREATE INDEX IF NOT EXISTS idx_${entity}_syncStatus ON ${entity}(syncStatus);
      CREATE INDEX IF NOT EXISTS idx_${entity}_createdAt ON ${entity}(createdAt);
    `);
  }

  /**
   * Private: Get list of entity tables
   */
  private getEntityTables(): string[] {
    this.ensureDb();

    const stmt = this.db!.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);

    const tables = stmt.all() as any[];
    return tables.map((t) => t.name);
  }

  /**
   * Private: Convert database row to StoredEntity
   */
  private rowToEntity<T>(row: any): StoredEntity<T> {
    return {
      _meta: {
        localId: row.localId,
        serverId: row.serverId,
        syncStatus: row.syncStatus as SyncStatus,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        lastSyncedAt: row.lastSyncedAt ? new Date(row.lastSyncedAt) : null,
        syncRetries: row.syncRetries,
        syncError: row.syncError,
      },
      data: JSON.parse(row.data),
    };
  }

  /**
   * Private: Start automatic sync on interval
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
        console.log(`[SqliteAdapter] Auto-sync triggered (${pendingCount} items pending)`);
      }

      try {
        await this.triggerSync();
      } catch (error) {
        console.error('[SqliteAdapter] Auto-sync error:', error);
      }
    }, this.config.autoSyncInterval);

    if (this.config.debug) {
      console.log(
        `[SqliteAdapter] Auto-sync started (interval: ${this.config.autoSyncInterval}ms)`
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
        console.log('[SqliteAdapter] Auto-sync stopped');
      }
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.stopAutoSync();
      this.db.close();
      this.db = null;

      if (this.config.debug) {
        console.log('[SqliteAdapter] Database closed');
      }
    }
  }
}