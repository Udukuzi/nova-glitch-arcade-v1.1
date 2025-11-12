// Mobile wallet detection and deep link utilities

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
};

// Check if wallet app is installed
export const isPhantomInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'phantom' in window && (window as any).phantom?.solana?.isPhantom;
};

export const isSolflareInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'solflare' in window;
};

// Mobile deep links for wallet apps
export const getMobileWalletDeepLink = (wallet: 'phantom' | 'solflare', action: 'connect' | 'browse' = 'connect'): string => {
  // Get the CURRENT URL (not cached)
  const currentUrl = window.location.href;
  const appUrl = window.location.origin;
  
  if (wallet === 'phantom') {
    // Phantom universal link format
    const encodedUrl = encodeURIComponent(currentUrl);
    return `https://phantom.app/ul/browse/${appUrl}?ref=${encodedUrl}`;
  }
  
  if (wallet === 'solflare') {
    // Solflare has issues with deep links, return empty to use standard adapter
    return '';
  }
  
  return '';
};

// Open wallet app on mobile
export const openMobileWallet = (wallet: 'phantom' | 'solflare'): boolean => {
  if (!isMobile()) return false;
  
  const deepLink = getMobileWalletDeepLink(wallet, 'browse');
  
  // If no deep link (like Solflare), return false to use standard adapter
  if (!deepLink) {
    return false;
  }
  
  // Try to open the app
  window.location.href = deepLink;
  
  // Fallback to app store after 2 seconds if app doesn't open
  setTimeout(() => {
    if (document.hidden) return; // App opened successfully
    
    // App didn't open, redirect to download page
    const downloadUrl = wallet === 'phantom' 
      ? 'https://phantom.app/download'
      : 'https://solflare.com/download';
    window.open(downloadUrl, '_blank');
  }, 2000);
  
  return true;
};

// Get wallet connection instructions for mobile
export const getMobileWalletInstructions = (wallet: 'phantom' | 'solflare'): string => {
  if (wallet === 'phantom') {
    return isIOS() 
      ? 'Tap to open Phantom app. If not installed, you\'ll be redirected to the App Store.'
      : 'Tap to open Phantom app. If not installed, you\'ll be redirected to Google Play.';
  }
  
  if (wallet === 'solflare') {
    return isIOS()
      ? 'Tap to open Solflare app. If not installed, you\'ll be redirected to the App Store.'
      : 'Tap to open Solflare app. If not installed, you\'ll be redirected to Google Play.';
  }
  
  return '';
};

// Check if we're inside a wallet's in-app browser
export const isInWalletBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes('phantom') ||
    userAgent.includes('solflare') ||
    isPhantomInstalled() ||
    isSolflareInstalled()
  );
};

// Get recommended action for current environment
export const getWalletConnectionMethod = (): 'extension' | 'mobile-deeplink' | 'in-app' => {
  if (isInWalletBrowser()) {
    return 'in-app';
  }
  
  if (isMobile()) {
    return 'mobile-deeplink';
  }
  
  return 'extension';
};
