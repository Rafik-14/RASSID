import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Network from 'expo-network';
import { pushSyncQueue } from './syncService';
import { getSupabase } from '@/api/supabase';
import { getDatabase } from '@/database';

const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const supabase = getSupabase();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }
    }

    const db = await getDatabase();
    const metaRow = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_meta WHERE key = 'failed_sync_attempts'`
    );
    const attempts = parseInt(metaRow?.value || '0', 10);
    const lastAttemptRow = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_meta WHERE key = 'last_sync_attempt'`
    );
    const lastAttempt = lastAttemptRow ? new Date(lastAttemptRow.value).getTime() : 0;

    const backoffMs = attempts > 0 ? (15 * 60 * 1000) * Math.pow(2, attempts - 1) : 0;
    
    if (Date.now() - lastAttempt < backoffMs) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    await db.runAsync(
      `INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_sync_attempt', ?)`,
      [new Date().toISOString()]
    );

    const pushResult = await pushSyncQueue();
    
    if (pushResult.success) {
      await db.runAsync(
        `INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('failed_sync_attempts', '0')`
      );
      return pushResult.synced > 0 
        ? BackgroundFetch.BackgroundFetchResult.NewData 
        : BackgroundFetch.BackgroundFetchResult.NoData;
    } else {
      await db.runAsync(
        `INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('failed_sync_attempts', ?)`,
        [(attempts + 1).toString()]
      );
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  } catch (err) {
    try {
      const db = await getDatabase();
      const metaRow = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM sync_meta WHERE key = 'failed_sync_attempts'`
      );
      const attempts = parseInt(metaRow?.value || '0', 10);
      await db.runAsync(
        `INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('failed_sync_attempts', ?)`,
        [(attempts + 1).toString()]
      );
    } catch (dbErr) {
      // Ignored
    }
    
    if (__DEV__) {
      console.error('Background sync failed:', err);
    }
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false, 
        startOnBoot: true, 
      });
    }
  } catch (err) {
    if (__DEV__) {
      console.error('Task registration failed:', err);
    }
  }
}
