/**
 * DryJets Web Storage Export
 *
 * This file exports only the types and interfaces that are safe to import on the web.
 * It does NOT import the sqlite-adapter, preventing build errors on web platforms.
 */

// Re-export only safe types (no implementations that require better-sqlite3)
export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  FAILED = 'failed',
}

export enum NetworkStatus {
  ONLINE = 'online',
  SYNCING = 'syncing',
  OFFLINE = 'offline',
}

export interface StorageMetadata {
  localId: string;
  serverId: string | null;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt: Date | null;
  syncRetries: number;
  syncError: string | null;
}

export interface StoredEntity<T = any> {
  _meta: StorageMetadata;
  data: T;
}

export interface SyncBatch {
  entity: string;
  items: StoredEntity[];
}

export interface SyncResult {
  entity: string;
  localId: string;
  serverId: string | null;
  success: boolean;
  error?: string;
}

export interface QueryOptions {
  syncStatus?: SyncStatus | SyncStatus[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  dateRange?: {
    field: string;
    from?: Date;
    to?: Date;
  };
}

export interface StorageAdapter {
  init(): Promise<void>;
  saveLocal<T>(entity: string, payload: T): Promise<string>;
  updateLocal<T>(entity: string, localId: string, payload: Partial<T>): Promise<StoredEntity<T>>;
  deleteLocal(entity: string, localId: string): Promise<void>;
  getById<T>(entity: string, localId: string): Promise<StoredEntity<T> | null>;
  getByServerId<T>(entity: string, serverId: string): Promise<StoredEntity<T> | null>;
  list<T>(entity: string, options?: QueryOptions): Promise<StoredEntity<T>[]>;
  listPending<T>(entity: string): Promise<StoredEntity<T>[]>;
  markSynced(entity: string, localId: string, serverId: string): Promise<void>;
  markSyncFailed(entity: string, localId: string, error: string): Promise<void>;
  getPendingCount(): Promise<number>;
  getPendingCountForEntity(entity: string): Promise<number>;
  onSync(handler: (batch: SyncBatch) => Promise<SyncResult[]>): void;
  triggerSync(): Promise<SyncResult[]>;
  clearAll(): Promise<void>;
  exportData(): Promise<string>;
  importData(jsonData: string): Promise<void>;
}

export enum ConflictResolution {
  SERVER_WINS = 'server_wins',
  CLIENT_WINS = 'client_wins',
  MERGE = 'merge',
  MANUAL = 'manual',
}

export interface SyncConflict<T = any> {
  entity: string;
  localId: string;
  serverId: string;
  localData: T;
  serverData: T;
  localUpdatedAt: Date;
  serverUpdatedAt: Date;
}

export interface SyncConfig {
  autoSyncInterval?: number;
  batchSize?: number;
  maxRetries?: number;
  retryBackoff?: number;
  conflictResolution?: ConflictResolution;
  debug?: boolean;
}

export async function createStorageAdapter(
  platform: 'web' | 'desktop',
  config?: SyncConfig
): Promise<StorageAdapter> {
  if (platform === 'web') {
    // Dynamically import only the Dexie adapter for web
    const dexieModule = await import('./adapters/dexie-adapter');
    return new dexieModule.DexieAdapter(config);
  } else {
    throw new Error('SQLite adapter not available on web platform - use desktop app instead');
  }
}

export function generateLocalId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isSynced(entity: StoredEntity): boolean {
  return entity._meta.syncStatus === SyncStatus.SYNCED && entity._meta.serverId !== null;
}

export function isPending(entity: StoredEntity): boolean {
  return entity._meta.syncStatus === SyncStatus.PENDING;
}

export function isFailed(entity: StoredEntity): boolean {
  return entity._meta.syncStatus === SyncStatus.FAILED;
}