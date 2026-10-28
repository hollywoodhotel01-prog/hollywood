/**
 * Midiland / Hollywood Hotel Offline & Online Synchronization Engine
 * Automatically tracks connectivity, queues offline changes, and drains
 * the outbox queue when Wi-Fi / Internet connection is restored.
 */

import {
  addToSyncQueue,
  getPendingSyncQueue,
  removeSyncQueueItem,
  updateSyncQueueItem,
  setMetadata,
  getMetadata,
  SyncQueueItem,
} from "./offlineDb";

export type SyncStatus = "online" | "offline" | "syncing";

export interface SyncEngineState {
  status: SyncStatus;
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
}

type SyncStateListener = (state: SyncEngineState) => void;
type RefreshCallback = () => Promise<void>;

class SyncEngine {
  private isOnline: boolean = typeof navigator !== "undefined" ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private pendingCount: number = 0;
  private lastSyncedAt: string | null = null;
  private lastError: string | null = null;
  private listeners: Set<SyncStateListener> = new Set();
  private refreshCallbacks: Set<RefreshCallback> = new Set();
  private heartbeatTimer: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private async init() {
    this.isOnline = navigator.onLine;

    // Load initial metadata and pending count
    try {
      const lastSync = await getMetadata<string>("lastSyncTime");
      if (lastSync) this.lastSyncedAt = lastSync;
      await this.updatePendingCount();
    } catch (_) {}

    // Listen to browser network state events
    window.addEventListener("online", () => this.handleNetworkChange(true));
    window.addEventListener("offline", () => this.handleNetworkChange(false));

    // Periodic heartbeat check (every 20s) to verify actual internet access
    this.heartbeatTimer = setInterval(() => {
      this.checkConnectivity();
    }, 20000);

    // Initial check and auto-sync if pending items exist
    this.checkConnectivity().then(() => {
      if (this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  private async updatePendingCount(): Promise<number> {
    try {
      const items = await getPendingSyncQueue();
      this.pendingCount = items.length;
      this.notify();
      return this.pendingCount;
    } catch (_) {
      return 0;
    }
  }

  private async handleNetworkChange(online: boolean) {
    if (online) {
      // Confirm real internet connectivity before declaring fully online
      const trulyOnline = await this.pingConnectivity();
      this.isOnline = trulyOnline;
      this.notify();
      if (trulyOnline) {
        // Automatically drain sync queue when Wi-Fi connects
        await this.processSyncQueue();
      }
    } else {
      this.isOnline = false;
      this.notify();
    }
  }

  /**
   * Lightweight ping to verify real server reachability.
   */
  public async pingConnectivity(): Promise<boolean> {
    if (typeof window === "undefined") return true;
    if (!navigator.onLine) return false;

    try {
      // Use rooms API with cache bust and short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`/api/rooms?_ping=${Date.now()}`, {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.status < 500;
    } catch (e) {
      // Try fallback to favicon or manifest
      try {
        const fallbackRes = await fetch(`/manifest.webmanifest?_ping=${Date.now()}`, {
          method: "HEAD",
          cache: "no-store",
        });
        return fallbackRes.ok;
      } catch {
        return false;
      }
    }
  }

  public async checkConnectivity(): Promise<boolean> {
    if (typeof window === "undefined") return true;
    const wasOnline = this.isOnline;
    const isNowOnline = await this.pingConnectivity();

    if (wasOnline !== isNowOnline) {
      this.isOnline = isNowOnline;
      this.notify();
      if (isNowOnline) {
        await this.processSyncQueue();
      }
    }

    return isNowOnline;
  }

  /**
   * Queue a data mutation (create, update, delete) to be synchronized.
   */
  public async queueMutation(
    endpoint: string,
    method: "POST" | "PUT" | "DELETE",
    payload: any,
    description: string
  ): Promise<SyncQueueItem> {
    const item = await addToSyncQueue({
      endpoint,
      method,
      payload,
      description,
    });

    await this.updatePendingCount();

    // If online, immediately try to sync
    if (this.isOnline && !this.isSyncing) {
      // Fire-and-forget sync in background
      this.processSyncQueue().catch(console.error);
    }

    return item;
  }

  /**
   * Drain the synchronization queue in chronological order (FIFO).
   */
  public async processSyncQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    if (!this.isOnline) {
      await this.updatePendingCount();
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.lastError = null;
    this.notify();

    let synced = 0;
    let failed = 0;

    try {
      const queue = await getPendingSyncQueue();
      if (queue.length === 0) {
        this.isSyncing = false;
        this.notify();
        return { synced: 0, failed: 0 };
      }

      for (const item of queue) {
        await updateSyncQueueItem(item.id, { status: "syncing" });
        this.notify();

        try {
          const fetchOptions: RequestInit = {
            method: item.method,
            headers: {
              "Content-Type": "application/json",
            },
          };

          if (item.method !== "DELETE" && item.payload) {
            fetchOptions.body = JSON.stringify(item.payload);
          } else if (item.method === "DELETE" && item.payload && Object.keys(item.payload).length > 0) {
            fetchOptions.body = JSON.stringify(item.payload);
          }

          const res = await fetch(item.endpoint, fetchOptions);

          if (res.ok || res.status === 200 || res.status === 201) {
            // Successfully synchronized! Remove from queue
            await removeSyncQueueItem(item.id);
            synced++;
          } else if (res.status === 400 || res.status === 404 || res.status === 409) {
            // Non-recoverable client error or conflict, remove so queue is not permanently stuck
            console.warn(`Sync item ${item.id} received status ${res.status}. Removing from queue.`);
            await removeSyncQueueItem(item.id);
            synced++;
          } else {
            // Server error 5xx: keep in queue for next retry
            throw new Error(`Server returned HTTP ${res.status}`);
          }
        } catch (itemErr: any) {
          failed++;
          const errorMessage = itemErr?.message || "Network request failed";
          await updateSyncQueueItem(item.id, {
            status: "failed",
            retries: item.retries + 1,
            lastError: errorMessage,
          });

          // If network failed completely, stop processing further items for now
          if (
            errorMessage.includes("Failed to fetch") ||
            errorMessage.includes("NetworkError") ||
            errorMessage.includes("abort")
          ) {
            this.isOnline = false;
            this.lastError = "Connection lost during synchronization.";
            break;
          }
        }
      }

      // Record successful sync time
      if (synced > 0) {
        const nowIso = new Date().toISOString();
        this.lastSyncedAt = nowIso;
        await setMetadata("lastSyncTime", nowIso);

        // Notify app to refresh live data across all contexts
        await this.triggerRefreshCallbacks();
      }
    } catch (err: any) {
      console.error("processSyncQueue global error:", err);
      this.lastError = err?.message || "Sync error";
    } finally {
      this.isSyncing = false;
      await this.updatePendingCount();
      this.notify();
    }

    return { synced, failed };
  }

  /**
   * Register a callback triggered when sync finishes so contexts can re-fetch latest data.
   */
  public onSyncComplete(callback: RefreshCallback): () => void {
    this.refreshCallbacks.add(callback);
    return () => {
      this.refreshCallbacks.delete(callback);
    };
  }

  private async triggerRefreshCallbacks() {
    for (const callback of this.refreshCallbacks) {
      try {
        await callback();
      } catch (e) {
        console.error("Error in onSyncComplete callback:", e);
      }
    }
  }

  public getState(): SyncEngineState {
    let status: SyncStatus = "online";
    if (!this.isOnline) {
      status = "offline";
    } else if (this.isSyncing) {
      status = "syncing";
    }

    return {
      status,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.pendingCount,
      lastSyncedAt: this.lastSyncedAt,
      lastError: this.lastError,
    };
  }

  public subscribe(listener: SyncStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        console.error("Sync listener error:", e);
      }
    });
  }
}

// Global Singleton
export const syncEngine = new SyncEngine();
