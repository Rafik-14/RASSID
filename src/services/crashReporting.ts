import * as Sentry from '@sentry/react-native';

export function initCrashReporting() {
  if (!__DEV__) {
    Sentry.init({
      dsn: 'https://47cee9d374c92af6e687aa5bf298105b@o4511541137440768.ingest.de.sentry.io/4511541150548048',
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