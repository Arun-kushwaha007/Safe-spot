/**
 * Analytics Service
 * 
 * Centralized logging for tracking user behavior and success metrics.
 * Currently logs to console in development.
 * Ready to integrate with Firebase Analytics or PostHog.
 */

export const logEvent = async (name: string, params: Record<string, any> = {}) => {
  try {
    // In production, we would send this to Firebase/PostHog
    if (__DEV__) {
      console.log(`[Analytics] ${name}`, params);
    }
    
    // Placeholder for real implementation
    // await Analytics.logEvent(name, params);
  } catch (error) {
    console.error('[Analytics] Failed to log event:', error);
  }
};

export const Events = {
  APP_OPEN: 'app_open',
  TOILET_ADDED: 'toilet_added',
  REPORT_SUBMITTED: 'report_submitted',
  ROUTE_STARTED: 'route_started',
  VIEW_TOILET: 'view_toilet',
};
