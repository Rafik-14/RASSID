import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { env, hasSupabase } from '@/config/env';
import { getLastHandshake } from './syncService';

const SESSION_KEY = 'rassid_session_ok';
const OFFLINE_MS_PER_HOUR = 60 * 60 * 1000;

export async function authenticateUser(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    await SecureStore.setItemAsync(SESSION_KEY, '1');
    return true;
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) {
    await SecureStore.setItemAsync(SESSION_KEY, '1');
    return true;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'RASSID — Authentification',
    cancelLabel: 'Annuler',
    fallbackLabel: 'Code',
  });

  if (result.success) {
    await SecureStore.setItemAsync(SESSION_KEY, '1');
  }
  return result.success;
}

export async function isOfflineLocked(): Promise<boolean> {
  if (!hasSupabase) return false; // Bypass offline lock if Supabase is not configured (offline demo mode)
  const last = await getLastHandshake();
  if (!last) return false;
  const hours = env.offlineLockHours;
  const elapsed = Date.now() - new Date(last).getTime();
  return elapsed > hours * OFFLINE_MS_PER_HOUR;
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

/** Placeholder for root/jailbreak detection — extend with native module in production build */
export function isDeviceCompromised(): boolean {
  return false;
}
