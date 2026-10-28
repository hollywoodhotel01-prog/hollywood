"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  X,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { syncEngine, SyncEngineState } from "@/lib/syncEngine";
import { getPendingSyncQueue, SyncQueueItem } from "@/lib/offlineDb";

export default function OfflineSyncBanner() {
  const [state, setState] = useState<SyncEngineState>(syncEngine.getState());
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSyncSuccessToast, setShowSyncSuccessToast] = useState(false);
  const [prevStatus, setPrevStatus] = useState(state.status);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((newState) => {
      // If we just transitioned from syncing -> online with 0 pending items, show success toast
      if (
        (prevStatus === "syncing" || newState.pendingCount < state.pendingCount) &&
        newState.isOnline &&
        !newState.isSyncing &&
        newState.pendingCount === 0
      ) {
        setShowSyncSuccessToast(true);
        setTimeout(() => setShowSyncSuccessToast(false), 4500);
      }
      setPrevStatus(newState.status);
      setState(newState);
    });

    return unsubscribe;
  }, [prevStatus, state.pendingCount]);

  // Load queue items when modal is opened or pending count changes
  useEffect(() => {
    if (isModalOpen || state.pendingCount > 0) {
      getPendingSyncQueue().then(setQueueItems).catch(console.error);
    }
  }, [isModalOpen, state.pendingCount]);

  const handleManualSync = async () => {
    await syncEngine.checkConnectivity();
    await syncEngine.processSyncQueue();
    const updated = await getPendingSyncQueue();
    setQueueItems(updated);
  };

  const formatTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return isoStr;
    }
  };

  return (
    <>
      {/* ─── FLOATING SYNC STATUS PILL ─────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-auto">
        <AnimatePresence>
          {/* Sync Success Toast */}
          {showSyncSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="bg-emerald-900/90 text-emerald-100 border border-emerald-500/50 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold"
            >
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>All offline changes synchronized successfully with Wi-Fi!</span>
              <button
                onClick={() => setShowSyncSuccessToast(false)}
                className="text-emerald-300 hover:text-white ml-1 p-0.5"
              >
                <X size={13} />
              </button>
            </motion.div>
          )}

          {/* Main Status Badge */}
          {!state.isOnline ? (
            // Offline Warning Pill
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-500/95 text-black border border-amber-300 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold cursor-pointer hover:bg-amber-400 transition-all select-none"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="relative flex items-center justify-center">
                <WifiOff size={16} className="text-black" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold uppercase tracking-wider text-[11px]">
                  Offline Mode Active
                </span>
                <span className="font-medium text-[11px] text-black/80">
                  {state.pendingCount > 0
                    ? `${state.pendingCount} change${state.pendingCount > 1 ? "s" : ""} queued for Wi-Fi sync`
                    : "Working locally · Auto-syncs on Wi-Fi"}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleManualSync();
                }}
                title="Check Wi-Fi and Sync Now"
                className="ml-1 p-1.5 bg-black/10 hover:bg-black/20 rounded-lg text-black transition-colors"
              >
                <RefreshCw size={13} />
              </button>
            </motion.div>
          ) : state.isSyncing ? (
            // Syncing Pill
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-600/95 text-white border border-blue-400/50 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <RefreshCw size={15} className="animate-spin text-white shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-extrabold uppercase tracking-wider text-[11px]">
                  Wi-Fi Reconnected
                </span>
                <span className="font-medium text-[11px] text-blue-100">
                  Synchronizing {state.pendingCount} offline change{state.pendingCount > 1 ? "s" : ""}...
                </span>
              </div>
            </motion.div>
          ) : state.pendingCount > 0 ? (
            // Online with pending items
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/90 text-white border border-gold/40 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold cursor-pointer hover:border-gold transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
              <span>{state.pendingCount} pending Wi-Fi sync</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleManualSync();
                }}
                className="ml-1 p-1 bg-gold/20 hover:bg-gold/30 text-gold rounded-md"
              >
                <RefreshCw size={12} />
              </button>
            </motion.div>
          ) : (
            // Clean Online Badge (Collapsible indicator)
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-[11px] font-medium cursor-pointer transition-all hover:text-white"
              onClick={() => setIsModalOpen(true)}
              title="Hollywood Hotel Online & Synchronized"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Online &amp; In Sync</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── MODAL: OFFLINE SYNC DETAILS & OUTBOX DRAWER ──────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#121212] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      !state.isOnline
                        ? "bg-amber-500/20 text-amber-400"
                        : state.isSyncing
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {!state.isOnline ? (
                      <WifiOff size={18} />
                    ) : state.isSyncing ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <Wifi size={18} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-white">
                      Offline &amp; Sync Engine
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {!state.isOnline
                        ? "Device is disconnected. Changes are stored locally."
                        : state.isSyncing
                        ? "Synchronizing pending data with Google Sheets..."
                        : "Connected to Wi-Fi. All data is synchronized."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Overview Card */}
              <div className="my-5 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Connection Status
                  </span>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        !state.isOnline
                          ? "bg-amber-400"
                          : state.isSyncing
                          ? "bg-blue-400 animate-pulse"
                          : "bg-emerald-400"
                      }`}
                    />
                    <span className="text-white">
                      {!state.isOnline
                        ? "Offline (Local Storage Mode)"
                        : state.isSyncing
                        ? "Syncing via Wi-Fi..."
                        : "Online & Connected"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleManualSync}
                  disabled={state.isSyncing}
                  className="px-3.5 py-2 bg-gold hover:bg-gold/90 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={13} className={state.isSyncing ? "animate-spin" : ""} />
                  <span>Sync Now</span>
                </button>
              </div>

              {/* Outbox Queue Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <span>Pending Outbox Queue ({queueItems.length})</span>
                  {state.lastSyncedAt && (
                    <span className="text-[11px] font-normal text-zinc-500">
                      Last sync: {formatTime(state.lastSyncedAt)}
                    </span>
                  )}
                </div>

                {queueItems.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800 text-center">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2 opacity-80" />
                    <p className="text-sm font-semibold text-zinc-200">
                      No pending changes
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Everything you do offline is automatically queued here and synced when Wi-Fi is available.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {queueItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-zinc-200">
                            {item.description || `${item.method} ${item.endpoint}`}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                            <Clock size={11} />
                            <span>{formatTime(item.timestamp)}</span>
                            <span>•</span>
                            <span className="uppercase text-gold font-bold text-[10px]">
                              {item.method}
                            </span>
                            <span>•</span>
                            <span className="text-zinc-400">{item.endpoint}</span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                            item.status === "syncing"
                              ? "bg-blue-500/20 text-blue-300"
                              : item.status === "failed"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
