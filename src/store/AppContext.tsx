import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { getDatabase } from '@/database';
import { getPendingSyncCount } from '@/database/queries';
import { pushSyncQueue } from '@/services/syncService';

interface AppContextValue {
  refreshKey: number;
  pendingSync: number;
  syncing: boolean;
  refresh: () => Promise<void>;
  syncNow: () => Promise<string>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingSync, setPendingSync] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    await getDatabase();
    const count = await getPendingSyncCount();
    setPendingSync(count);
    setRefreshKey((k) => k + 1);
  }, []);

  const syncNow = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await pushSyncQueue();
      await refresh();
      return result.message;
    } finally {
      setSyncing(false);
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ refreshKey, pendingSync, syncing, refresh, syncNow }),
    [refreshKey, pendingSync, syncing, refresh, syncNow]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
