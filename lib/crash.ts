/**
 * Crash Reporting Service
 * 
 * Centralized error handling for the application.
 * Currently logs to console in development.
 * ready to integrate with Sentry.io.
 */

// Placeholder for Sentry init
export const initCrashReporting = () => {
  if (__DEV__) {
    console.log('[Crash] Reporting initialized');
  } else {
    // Sentry.init({...})
  }
};

export const logError = (error: Error, context?: Record<string, any>) => {
  if (__DEV__) {
    console.error('[Crash] Error caught:', error);
    if (context) {
      console.log('[Crash] Context:', context);
    }
  } else {
    // Sentry.captureException(error, { extra: context });
  }
};

export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  // Simple error boundary placeholder
  // In production, use Sentry.ErrorBoundary or react-error-boundary
  return children;
};
