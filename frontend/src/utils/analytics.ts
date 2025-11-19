/**
 * Analytics Tracking - Google Analytics 4 & Custom Events
 * Track user behavior, conversions, and key metrics
 */

// Types
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

// Initialize Google Analytics
// NOTE: GA script is loaded in index.html, this just verifies it's ready
export function initializeAnalytics(measurementId?: string) {
  if (typeof window === 'undefined') return;

  // Verify gtag is loaded from index.html
  if (window.gtag) {
    console.log('📊 Analytics initialized (loaded from index.html)');
  } else {
    console.warn('⚠️ Google Analytics not loaded. Check index.html for GA script.');
  }
}

// Track pageview
export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title
  });

  console.log('📄 Page view:', path);
}

// Track custom event
export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', event.action, {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
    ...event.metadata
  });

  // Also log to console in development
  if (import.meta.env.DEV) {
    console.log('📊 Event:', event);
  }
}

// Pre-defined tracking functions

export const Analytics = {
  // Wallet Events
  walletConnected: (wallet: string) => {
    trackEvent({
      category: 'Wallet',
      action: 'connected',
      label: wallet,
      metadata: { wallet_type: wallet }
    });
  },

  walletDisconnected: () => {
    trackEvent({
      category: 'Wallet',
      action: 'disconnected'
    });
  },

  // Game Events
  gameStarted: (gameName: string) => {
    trackEvent({
      category: 'Game',
      action: 'started',
      label: gameName,
      metadata: { game: gameName }
    });
  },

  gameCompleted: (gameName: string, score: number, duration: number) => {
    trackEvent({
      category: 'Game',
      action: 'completed',
      label: gameName,
      value: score,
      metadata: {
        game: gameName,
        score,
        duration_seconds: duration
      }
    });
  },

  highScore: (gameName: string, score: number, rank?: number) => {
    trackEvent({
      category: 'Achievement',
      action: 'high_score',
      label: gameName,
      value: score,
      metadata: {
        game: gameName,
        score,
        rank
      }
    });
  },

  // Swap Events
  swapInitiated: (fromToken: string, toToken: string, amount: number) => {
    trackEvent({
      category: 'Swap',
      action: 'initiated',
      label: `${fromToken}_to_${toToken}`,
      value: amount,
      metadata: {
        from_token: fromToken,
        to_token: toToken,
        amount
      }
    });
  },

  swapCompleted: (fromToken: string, toToken: string, amount: number, signature: string) => {
    trackEvent({
      category: 'Swap',
      action: 'completed',
      label: `${fromToken}_to_${toToken}`,
      value: amount,
      metadata: {
        from_token: fromToken,
        to_token: toToken,
        amount,
        transaction_signature: signature
      }
    });
  },

  swapFailed: (fromToken: string, toToken: string, error: string) => {
    trackEvent({
      category: 'Swap',
      action: 'failed',
      label: `${fromToken}_to_${toToken}`,
      metadata: {
        from_token: fromToken,
        to_token: toToken,
        error_message: error
      }
    });
  },

  // Social Events
  scoreShared: (platform: string, gameName: string, score: number) => {
    trackEvent({
      category: 'Social',
      action: 'score_shared',
      label: platform,
      value: score,
      metadata: {
        platform,
        game: gameName,
        score
      }
    });
  },

  referralClicked: (source: string) => {
    trackEvent({
      category: 'Referral',
      action: 'link_clicked',
      label: source
    });
  },

  // Engagement Events
  leaderboardViewed: (timeframe: string) => {
    trackEvent({
      category: 'Engagement',
      action: 'leaderboard_viewed',
      label: timeframe
    });
  },

  tokenomicsViewed: () => {
    trackEvent({
      category: 'Engagement',
      action: 'tokenomics_viewed'
    });
  },

  settingsChanged: (setting: string, value: any) => {
    trackEvent({
      category: 'Settings',
      action: 'changed',
      label: setting,
      metadata: { setting, value }
    });
  },

  // Conversion Events
  firstDeposit: (amount: number, token: string) => {
    trackEvent({
      category: 'Conversion',
      action: 'first_deposit',
      label: token,
      value: amount,
      metadata: { amount, token }
    });
  },

  subscriptionStarted: (tier: string) => {
    trackEvent({
      category: 'Conversion',
      action: 'subscription_started',
      label: tier
    });
  },

  // Error Tracking
  errorOccurred: (error: string, context: string) => {
    trackEvent({
      category: 'Error',
      action: 'occurred',
      label: error,
      metadata: {
        error_message: error,
        context
      }
    });
  },

  // Performance Metrics
  performanceMetric: (metric: string, value: number) => {
    trackEvent({
      category: 'Performance',
      action: metric,
      value: Math.round(value),
      metadata: { [metric]: value }
    });
  }
};

// Track performance metrics
export function trackPerformance() {
  if (typeof window === 'undefined' || !window.performance) return;

  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  const connectTime = perfData.responseEnd - perfData.requestStart;
  const renderTime = perfData.domComplete - perfData.domLoading;

  Analytics.performanceMetric('page_load_time', pageLoadTime);
  Analytics.performanceMetric('connect_time', connectTime);
  Analytics.performanceMetric('render_time', renderTime);
}

// Track user session
export function trackSession() {
  const sessionStart = Date.now();

  // Track session duration on page unload
  window.addEventListener('beforeunload', () => {
    const duration = (Date.now() - sessionStart) / 1000;
    trackEvent({
      category: 'Session',
      action: 'ended',
      value: Math.round(duration),
      metadata: { duration_seconds: duration }
    });
  });
}

// Declare global gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
