import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

function read(key: string, fallback = ''): string {
  const fromProcess = process.env[key];
  if (fromProcess) return fromProcess;
  const fromExtra = (extra as Record<string, string>)[key];
  return fromExtra ?? fallback;
}

export const env = {
  supabaseUrl: read('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: read('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  /** Falls back to SecureStore profile via repService — overridden at boot in App.tsx */
  repName: read('EXPO_PUBLIC_REP_NAME', 'Distribution Amine'),
  repInitials: read('EXPO_PUBLIC_REP_INITIALS', 'AM'),
  printerMac: read('EXPO_PUBLIC_PRINTER_MAC'),
  offlineLockHours: Number(read('EXPO_PUBLIC_OFFLINE_LOCK_HOURS', '72')) || 72,
  sentryDsn: read('EXPO_PUBLIC_SENTRY_DSN'),
};

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);

/**
 * Mutates env.repName and env.repInitials from the saved SecureStore profile.
 * Called once during App.tsx boot so all screens that read `env.repName` get
 * the live value without needing to re-import.
 */
export function applyRepProfile(name: string, initials: string): void {
  (env as any).repName = name;
  (env as any).repInitials = initials;
}

