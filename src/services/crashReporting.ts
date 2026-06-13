import * as Sentry from '@sentry/react-native';
import { env } from '@/config/env';

export function initCrashReporting() {
  if (!__DEV__ && env.sentryDsn) {
    Sentry.init({
      dsn: env.sentryDsn,
      tracesSampleRate: 0.2,
    });
  }
}

export function reportError(error: Error, context?: Record<string, any>) {
  if (__DEV__) {
    console.error(error);
  } else {
    Sentry.captureException(error, { extra: context });
  }
}