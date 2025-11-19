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
  const currentUrl = window.location.href;
  const appUrl = window.location.origin;
  
  if (wallet === 'phantom') {
    // Use Phantom's proper deep link for connection
    if (isIOS()) {
      return `phantom://browse/${encodeURIComponent(currentUrl)}`;
    } else {
      // Android deep link
      return `https://phantom.app/ul/browse/${encodeURIComponent(currentUrl)}`;
    }
  }
  
  if (wallet === 'solflare') {
    // Solflare deep link format
    if (isIOS()) {
      return `solflare://browse?url=${encodeURIComponent(currentUrl)}`;
    } else {
      return `https://solflare.com/ul/browse/${encodeURIComponent(currentUrl)}`;
    }
  }
  
  return '';
};

// Open wallet app on mobile
export const openMobileWallet = (wallet: 'phantom' | 'solflare'): boolean => {
  if (!isMobile()) return false;
  
  const deepLink = getMobileWalletDeepLink(wallet, 'browse');
  
  if (!deepLink) {
    return false;
  }
  
  // Create a hidden iframe to trigger the deep link
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = deepLink;
  document.body.appendChild(iframe);
  
  // Clean up iframe after attempt
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
  
  // Also try direct window location as fallback
  setTimeout(() => {
    try {
      window.location.href = deepLink;
    } catch (e) {
      console.log('Deep link failed, using fallback');
    }
  }, 500);
  
  // Fallback to app store after 3 seconds if app doesn't open
  setTimeout(() => {
    if (document.hidden || document.visibilityState === 'hidden') {
      return; // App opened successfully
    }
    
    // App didn't open, redirect to download page
    const downloadUrl = wallet === 'phantom' 
      ? (isIOS() ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977' : 'https://play.google.com/store/apps/details?id=app.phantom')
      : (isIOS() ? 'https://apps.apple.com/app/solflare/id1580902717' : 'https://play.google.com/store/apps/details?id=com.solflare.mobile');
    
    const userConfirmed = confirm(`Wallet app not found. Would you like to download ${wallet}?`);
    if (userConfirmed) {
      window.open(downloadUrl, '_blank');
    }
  }, 3000);
  
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
  
  // Check for wallet-specific user agents
  const isPhantomBrowser = userAgent.includes('phantom') || userAgent.includes('phantomapp');
  const isSolflareBrowser = userAgent.includes('solflare');
  
  // Check if wallet objects are available (in-app browser)
  const hasPhantomObject = typeof window !== 'undefined' && 'phantom' in window;
  const hasSolflareObject = typeof window !== 'undefined' && 'solflare' in window;
  
  return isPhantomBrowser || isSolflareBrowser || hasPhantomObject || hasSolflareObject;
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
