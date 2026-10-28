/**
 * Midiland / Hollywood Hotel Offline Database (IndexedDB)
 * Provides robust offline storage and synchronization queue for all hotel operations.
 */

export interface SyncQueueItem {
  id: string;
  endpoint: string;
  method: "POST" | "PUT" | "DELETE";
  payload?: any;
  description: string;
  timestamp: string;
  retries: number;
  status: "pending" | "syncing" | "failed";
  lastError?: string;
}

const DB_NAME = "hollywood_hotel_offline_db";
const DB_VERSION = 1;

export const STORES = {
  ROOMS: "rooms",
  BOOKINGS: "bookings",
  GUESTS: "inHouseGuests",
  EVENTS: "conferenceBookings",
  EXPENSES: "expenses",
  OTHER_REVENUES: "otherRevenues",
  SAUNA: "saunaBookings",
  ADVANCES: "customerAdvances",
  INVOICES: "invoices",
  RECEIPTS: "receipts",
  SALES_HISTORY: "dailySalesHistory",
  STAFF: "staffUsers",
  SYNC_QUEUE: "syncQueue",
  METADATA: "metadata",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

/**
 * Open or initialize the IndexedDB database.
 */
export function getDb(): Promise<IDBDatabase> {
  if (!isBrowser()) {
    return Promise.reject(new Error("IndexedDB is only available in the browser"));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Entities with key 'id'
      const keyIdStores = [
        STORES.ROOMS,
        STORES.BOOKINGS,
        STORES.GUESTS,
        STORES.EVENTS,
        STORES.EXPENSES,
        STORES.OTHER_REVENUES,
        STORES.SAUNA,
        STORES.ADVANCES,
        STORES.INVOICES,
        STORES.RECEIPTS,
      ];

      for (const store of keyIdStores) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      }

      // Sales history (keyed by date or id)
      if (!db.objectStoreNames.contains(STORES.SALES_HISTORY)) {
        db.createObjectStore(STORES.SALES_HISTORY, { keyPath: "date" });
      }

      // Staff (keyed by uid or email)
      if (!db.objectStoreNames.contains(STORES.STAFF)) {
        db.createObjectStore(STORES.STAFF, { keyPath: "email" });
      }

      // Sync Outbox Queue
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: "id" });
        queueStore.createIndex("timestamp", "timestamp", { unique: false });
        queueStore.createIndex("status", "status", { unique: false });
      }

      // Metadata (key-value store)
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: "key" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("IndexedDB open failed:", request.error);
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn("IndexedDB blocked: please close other tabs of this application");
    };
  });

  return dbPromise;
}

/**
 * Save array of items to a specific store (overwriting existing keys).
 */
export async function saveAllToStore<T extends Record<string, any>>(
  storeName: StoreName,
  items: T[]
): Promise<void> {
  if (!isBrowser() || !Array.isArray(items)) return;
  try {
    const db = await getDb();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    for (const item of items) {
      if (item) {
        store.put(item);
      }
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error(`Transaction aborted in ${storeName}`));
    });
  } catch (err) {
    console.error(`saveAllToStore error (${storeName}):`, err);
  }
}

/**
 * Replace entire contents of a store with new items.
 */
export async function replaceStoreData<T extends Record<string, any>>(
  storeName: StoreName,
  items: T[]
): Promise<void> {
  if (!isBrowser()) return;
  try {
    const db = await getDb();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.clear();

    for (const item of items) {
      if (item) {
        store.put(item);
      }
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`replaceStoreData error (${storeName}):`, err);
  }
}

/**
 * Get all items from a store.
 */
export async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  if (!isBrowser()) return [];
  try {
    const db = await getDb();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve((request.result as T[]) || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`getAllFromStore error (${storeName}):`, err);
    return [];
  }
}

/**
 * Put a single item into a store.
 */
export async function putItemToStore<T extends Record<string, any>>(
  storeName: StoreName,
  item: T
): Promise<void> {
  if (!isBrowser() || !item) return;
  try {
    const db = await getDb();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(item);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`putItemToStore error (${storeName}):`, err);
  }
}

/**
 * Delete an item from a store by its key.
 */
export async function deleteItemFromStore(storeName: StoreName, key: IDBValidKey): Promise<void> {
  if (!isBrowser() || key === undefined || key === null) return;
  try {
    const db = await getDb();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.delete(key);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`deleteItemFromStore error (${storeName}):`, err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata Store (Key-Value)
// ─────────────────────────────────────────────────────────────────────────────

export async function setMetadata(key: string, value: any): Promise<void> {
  if (!isBrowser()) return;
  try {
    const db = await getDb();
    const tx = db.transaction(STORES.METADATA, "readwrite");
    const store = tx.objectStore(STORES.METADATA);
    store.put({ key, value, updatedAt: new Date().toISOString() });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("setMetadata error:", err);
  }
}

export async function getMetadata<T = any>(key: string): Promise<T | null> {
  if (!isBrowser()) return null;
  try {
    const db = await getDb();
    const tx = db.transaction(STORES.METADATA, "readonly");
    const store = tx.objectStore(STORES.METADATA);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result ? (request.result.value as T) : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("getMetadata error:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sync Queue (Outbox Operations)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a mutation to the synchronization queue.
 */
export async function addToSyncQueue(item: Omit<SyncQueueItem, "id" | "timestamp" | "status" | "retries"> & {
  id?: string;
  timestamp?: string;
}): Promise<SyncQueueItem> {
  const syncItem: SyncQueueItem = {
    id: item.id || `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    endpoint: item.endpoint,
    method: item.method,
    payload: item.payload,
    description: item.description,
    timestamp: item.timestamp || new Date().toISOString(),
    status: "pending",
    retries: 0,
  };

  await putItemToStore(STORES.SYNC_QUEUE, syncItem);
  return syncItem;
}

/**
 * Retrieve all pending mutations in the sync queue, sorted by timestamp ascending.
 */
export async function getPendingSyncQueue(): Promise<SyncQueueItem[]> {
  const items = await getAllFromStore<SyncQueueItem>(STORES.SYNC_QUEUE);
  return items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Remove an item from the sync queue once synced.
 */
export async function removeSyncQueueItem(id: string): Promise<void> {
  await deleteItemFromStore(STORES.SYNC_QUEUE, id);
}

/**
 * Update the status of a sync queue item.
 */
export async function updateSyncQueueItem(
  id: string,
  updates: Partial<SyncQueueItem>
): Promise<void> {
  if (!isBrowser()) return;
  try {
    const db = await getDb();
    const tx = db.transaction(STORES.SYNC_QUEUE, "readwrite");
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    const getReq = store.get(id);

    return new Promise((resolve, reject) => {
      getReq.onsuccess = () => {
        const item = getReq.result as SyncQueueItem;
        if (item) {
          store.put({ ...item, ...updates });
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.error("updateSyncQueueItem error:", err);
  }
}

/**
 * Get count of pending items in sync queue.
 */
export async function getSyncQueueCount(): Promise<number> {
  const items = await getPendingSyncQueue();
  return items.filter((it) => it.status === "pending" || it.status === "failed").length;
}
