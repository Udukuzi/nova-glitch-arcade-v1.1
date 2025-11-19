/**
 * Mobile Wallet Detection Utility
 * Detects and handles Phantom & Solflare mobile wallets
 */

export interface MobileWalletInfo {
  isPhantomInstalled: boolean;
  isSolflareInstalled: boolean;
  isMobileBrowser: boolean;
  canDeepLink: boolean;
}

export const detectMobileWallet = (): MobileWalletInfo => {
  const userAgent = navigator.userAgent || navigator.vendor;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Check if we're in Telegram WebApp
  const isTelegram = !!(window as any).Telegram?.WebApp?.initData;
  
  // Check if we're in Phantom's in-app browser
  const isPhantomBrowser = (window as any).phantom?.solana?.isPhantom || false;
  
  // Check if we're in Solflare's in-app browser
  const isSolflareBrowser = (window as any).solflare?.isSolflare || false;
  
  // Check if wallet extensions are available (mobile or desktop)
  const hasPhantom = !!(window as any).phantom?.solana;
  const hasSolflare = !!(window as any).solflare;
  
  return {
    isPhantomInstalled: hasPhantom || isPhantomBrowser,
    isSolflareInstalled: hasSolflare || isSolflareBrowser,
    isMobileBrowser: isMobile || isTelegram,
    canDeepLink: (isMobile || isTelegram) && !isPhantomBrowser && !isSolflareBrowser
  };
};

/**
 * Deep link to Phantom mobile app
 */
export const openPhantomMobile = (url?: string) => {
  const currentUrl = url || window.location.href;
  
  // Check if in Telegram
  const isTelegram = !!(window as any).Telegram?.WebApp;
  
  // Use proper deep link format
  const phantomUrl = `phantom://browse/${encodeURIComponent(currentUrl)}`;
  const phantomUniversalLink = `https://phantom.app/ul/browse/${encodeURIComponent(currentUrl)}?ref=https://phantom.app`;
  
  if (isTelegram) {
    // In Telegram, use openLink to open external URLs
    (window as any).Telegram.WebApp.openLink(phantomUniversalLink);
  } else {
    // Try deep link first, then universal link
    window.location.href = phantomUrl;
    
    // Fallback to universal link after short delay
    setTimeout(() => {
      window.location.href = phantomUniversalLink;
    }, 500);
    
    // Fallback to app store if Phantom doesn't open
    setTimeout(() => {
      const userAgent = navigator.userAgent || navigator.vendor;
      if (/android/i.test(userAgent)) {
        window.location.href = 'https://play.google.com/store/apps/details?id=app.phantom';
      } else if (/iPad|iPhone|iPod/.test(userAgent)) {
        window.location.href = 'https://apps.apple.com/app/phantom-solana-wallet/1598432977';
      }
    }, 2500);
  }
};

/**
 * Deep link to Solflare mobile app
 */
export const openSolflareMobile = (url?: string) => {
  const currentUrl = url || window.location.href;
  
  // Check if in Telegram
  const isTelegram = !!(window as any).Telegram?.WebApp;
  
  // Use proper deep link format
  const solflareUrl = `solflare://browse/${encodeURIComponent(currentUrl)}`;
  const solflareUniversalLink = `https://solflare.com/ul/v1/browse/${encodeURIComponent(currentUrl)}`;
  
  if (isTelegram) {
    // In Telegram, use openLink to open external URLs
    (window as any).Telegram.WebApp.openLink(solflareUniversalLink);
  } else {
    // Try deep link first, then universal link
    window.location.href = solflareUrl;
    
    // Fallback to universal link after short delay
    setTimeout(() => {
      window.location.href = solflareUniversalLink;
    }, 500);
    
    // Fallback to app store if Solflare doesn't open
    setTimeout(() => {
      const userAgent = navigator.userAgent || navigator.vendor;
      if (/android/i.test(userAgent)) {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.solflare.mobile';
      } else if (/iPad|iPhone|iPod/.test(userAgent)) {
        window.location.href = 'https://apps.apple.com/app/solflare/id1580902717';
      }
    }, 2500);
  }
};

/**
 * Get recommended wallet connection method for mobile
 */
export const getRecommendedWalletMethod = (): {
  method: 'phantom' | 'solflare' | 'walletconnect' | 'install';
  message: string;
  action: () => void;
} => {
  const walletInfo = detectMobileWallet();
  
  if (walletInfo.isPhantomInstalled) {
    return {
      method: 'phantom',
      message: 'Connect with Phantom',
      action: () => {}  // Will use standard wallet adapter
    };
  }
  
  if (walletInfo.isSolflareInstalled) {
    return {
      method: 'solflare',
      message: 'Connect with Solflare',
      action: () => {}  // Will use standard wallet adapter
    };
  }
  
  if (walletInfo.canDeepLink) {
    return {
      method: 'phantom',
      message: 'Open in Phantom App',
      action: () => openPhantomMobile()
    };
  }
  
  return {
    method: 'install',
    message: 'Install Phantom or Solflare',
    action: () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      if (/android/i.test(userAgent)) {
        window.open('https://play.google.com/store/apps/details?id=app.phantom', '_blank');
      } else if (/iPad|iPhone|iPod/.test(userAgent)) {
        window.open('https://apps.apple.com/app/phantom-solana-wallet/1598432977', '_blank');
      }
    }
  };
};

/**
 * Check if user should see mobile wallet prompt
 */
export const shouldShowMobileWalletPrompt = (): boolean => {
  const walletInfo = detectMobileWallet();
  
  // Show prompt if on mobile and no wallet detected
  return walletInfo.isMobileBrowser && !walletInfo.isPhantomInstalled && !walletInfo.isSolflareInstalled;
};
