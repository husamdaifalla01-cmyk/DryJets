/**
 * DryJets Offline-First Storage Adapters
 *
 * Universal storage interface for web (IndexedDB) and desktop (SQLite)
 * with optimistic updates and automatic sync when online.
 */

/**
 * Sync Status for items stored locally
 */
export enum SyncStatus {
  /** Item exists only locally, never synced */
  PENDING = 'pending',
  /** Item is currently being synced */
  SYNCING = 'syncing',
  /** Item successfully synced to server */
  SYNCED = 'synced',
  /** Sync failed, will retry */
  FAILED = 'failed',
}

/**
 * Network connection status
 */
export enum NetworkStatus {
  /** Connected to internet and API */
  ONLINE = 'online',
  /** Connected but currently syncing */
  SYNCING = 'syncing',
  /** No internet connection */
  OFFLINE = 'offline',
}

/**
 * Base metadata for all stored entities
 */
export interface StorageMetadata {
  /** Local UUID (client-side generated) */
  localId: string;
  /** Server-assigned ID (null if not yet synced) */
  serverId: string | null;
  /** Sync status */
  syncStatus: SyncStatus;
  /** Timestamp when created locally */
  createdAt: Date;
  /** Timestamp when last modified locally */
  updatedAt: Date;
  /** Timestamp when last synced to server */
  lastSyncedAt: Date | null;
  /** Number of sync retry attempts */
  syncRetries: number;
  /** Last sync error message */
  syncError: string | null;
}

/**
 * Stored entity wrapper
 */
export interface StoredEntity<T = any> {
  /** Metadata for sync tracking */
  _meta: StorageMetadata;
  /** The actual entity data */
  data: T;
}

/**
 * Batch of entities to sync to server
 */
export interface SyncBatch {
  /** Entity type (e.g., 'orders', 'customers', 'equipment') */
  entity: string;
  /** Items to be synced */
  items: StoredEntity[];
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
  /** Entity type */
  entity: string;
  /** Local ID */
  localId: string;
  /** Server ID (if successfully synced) */
  serverId: string | null;
  /** Whether sync succeeded */
  success: boolean;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Query options for fetching stored entities
 */
export interface QueryOptions {
  /** Filter by sync status */
  syncStatus?: SyncStatus | SyncStatus[];
  /** Limit number of results */
  limit?: number;
  /** Skip first N results (pagination) */
  offset?: number;
  /** Sort by field */
  sortBy?: string;
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Filter by date range */
  dateRange?: {
    field: string;
    from?: Date;
    to?: Date;
  };
}

/**
 * Universal storage adapter interface
 *
 * Implementations:
 * - DexieAdapter: Web (IndexedDB via Dexie.js)
 * - SqliteAdapter: Desktop (SQLite via better-sqlite3)
 */
export interface StorageAdapter {
  /**
   * Initialize the storage adapter
   */
  init(): Promise<void>;

  /**
   * Save an entity locally (optimistic update)
   *
   * @param entity - Entity type (e.g., 'orders')
   * @param payload - Entity data
   * @returns Local ID of saved entity
   */
  saveLocal<T>(entity: string, payload: T): Promise<string>;

  /**
   * Update an existing entity locally
   *
   * @param entity - Entity type
   * @param localId - Local ID of entity to update
   * @param payload - Updated data (partial or full)
   * @returns Updated entity
   */
  updateLocal<T>(
    entity: string,
    localId: string,
    payload: Partial<T>
  ): Promise<StoredEntity<T>>;

  /**
   * Delete an entity locally
   *
   * @param entity - Entity type
   * @param localId - Local ID of entity to delete
   */
  deleteLocal(entity: string, localId: string): Promise<void>;

  /**
   * Get a single entity by local ID
   *
   * @param entity - Entity type
   * @param localId - Local ID
   * @returns Stored entity or null
   */
  getById<T>(entity: string, localId: string): Promise<StoredEntity<T> | null>;

  /**
   * Get a single entity by server ID
   *
   * @param entity - Entity type
   * @param serverId - Server ID
   * @returns Stored entity or null
   */
  getByServerId<T>(entity: string, serverId: string): Promise<StoredEntity<T> | null>;

  /**
   * List all entities of a type (with optional filters)
   *
   * @param entity - Entity type
   * @param options - Query options
   * @returns List of stored entities
   */
  list<T>(entity: string, options?: QueryOptions): Promise<StoredEntity<T>[]>;

  /**
   * List all entities pending sync
   *
   * @param entity - Entity type
   * @returns List of pending entities
   */
  listPending<T>(entity: string): Promise<StoredEntity<T>[]>;

  /**
   * Mark an entity as synced (after successful API call)
   *
   * @param entity - Entity type
   * @param localId - Local ID
   * @param serverId - Server-assigned ID
   */
  markSynced(entity: string, localId: string, serverId: string): Promise<void>;

  /**
   * Mark an entity as failed sync
   *
   * @param entity - Entity type
   * @param localId - Local ID
   * @param error - Error message
   */
  markSyncFailed(entity: string, localId: string, error: string): Promise<void>;

  /**
   * Get count of pending items across all entities
   *
   * @returns Total number of unsynced items
   */
  getPendingCount(): Promise<number>;

  /**
   * Get count of pending items for specific entity
   *
   * @param entity - Entity type
   * @returns Number of unsynced items
   */
  getPendingCountForEntity(entity: string): Promise<number>;

  /**
   * Register a sync handler (called automatically when network is available)
   *
   * @param handler - Function to sync batch to server
   */
  onSync(handler: (batch: SyncBatch) => Promise<SyncResult[]>): void;

  /**
   * Manually trigger sync for all pending items
   *
   * @returns Array of sync results
   */
  triggerSync(): Promise<SyncResult[]>;

  /**
   * Clear all local data (dangerous!)
   */
  clearAll(): Promise<void>;

  /**
   * Export all data as JSON (for debugging/backup)
   *
   * @returns JSON string of all stored data
   */
  exportData(): Promise<string>;

  /**
   * Import data from JSON (for restore/migration)
   *
   * @param jsonData - JSON string to import
   */
  importData(jsonData: string): Promise<void>;
}

/**
 * Conflict resolution strategy when server data differs from local
 */
export enum ConflictResolution {
  /** Server wins (overwrite local changes) */
  SERVER_WINS = 'server_wins',
  /** Client wins (keep local changes) */
  CLIENT_WINS = 'client_wins',
  /** Merge (attempt to combine both) */
  MERGE = 'merge',
  /** Manual (prompt user to resolve) */
  MANUAL = 'manual',
}

/**
 * Conflict detected during sync
 */
export interface SyncConflict<T = any> {
  /** Entity type */
  entity: string;
  /** Local ID */
  localId: string;
  /** Server ID */
  serverId: string;
  /** Local version of data */
  localData: T;
  /** Server version of data */
  serverData: T;
  /** Timestamp of local update */
  localUpdatedAt: Date;
  /** Timestamp of server update */
  serverUpdatedAt: Date;
}

/**
 * Sync configuration
 */
export interface SyncConfig {
  /** Auto-sync interval in milliseconds (default: 30000 = 30 seconds) */
  autoSyncInterval?: number;
  /** Max items per batch (default: 50) */
  batchSize?: number;
  /** Max retry attempts for failed syncs (default: 3) */
  maxRetries?: number;
  /** Backoff multiplier for retries (default: 2) */
  retryBackoff?: number;
  /** Conflict resolution strategy (default: SERVER_WINS) */
  conflictResolution?: ConflictResolution;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Factory function to create the appropriate storage adapter
 *
 * @param platform - 'web' or 'desktop'
 * @param config - Sync configuration
 * @returns Storage adapter instance
 */
export async function createStorageAdapter(
  platform: 'web' | 'desktop',
  config?: SyncConfig
): Promise<StorageAdapter> {
  if (platform === 'web') {
    // Web platform - use IndexedDB via Dexie
    const { DexieAdapter } = await import('./adapters/dexie-adapter');
    return new DexieAdapter(config);
  } else {
    // Desktop platform - use SQLite (only available in Electron)
    try {
      const { SqliteAdapter } = await import('./adapters/sqlite-adapter');
      return new SqliteAdapter(config);
    } catch (error) {
      throw new Error('SQLite adapter not available - ensure you are running the desktop app');
    }
  }
}

/**
 * Generate a unique local ID (UUID v4)
 */
export function generateLocalId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Check if entity has been synced to server
 */
export function isSynced(entity: StoredEntity): boolean {
  return entity._meta.syncStatus === SyncStatus.SYNCED && entity._meta.serverId !== null;
}

/**
 * Check if entity is pending sync
 */
export function isPending(entity: StoredEntity): boolean {
  return entity._meta.syncStatus === SyncStatus.PENDING;
}

/**
 * Check if entity failed to sync
 */
export function isFailed(entity: StoredEntity): boolean {
  return entity._meta.syncStatus === SyncStatus.FAILED;
}