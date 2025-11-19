/**
 * Telegram WebApp Wrapper
 * Optimizes the app for Telegram's in-app browser
 */

import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramWrapperProps {
  children: React.ReactNode;
}

export default function TelegramWrapper({ children }: TelegramWrapperProps) {
  useEffect(() => {
    try {
      console.log('🤖 Telegram WebApp initializing...');
      
      // Initialize Telegram WebApp
      WebApp.ready();
      
      // Expand to full height
      WebApp.expand();
      
      // Set theme colors to match arcade
      WebApp.setHeaderColor('#1a0a2e');
      WebApp.setBackgroundColor('#000000');
      
      // Enable closing confirmation
      WebApp.enableClosingConfirmation();
      
      // Log Telegram user info
      const user = WebApp.initDataUnsafe?.user;
      if (user) {
        console.log('✅ Telegram User:', {
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name
        });
      }
      
      // Log platform info
      console.log('📱 Telegram Platform:', {
        platform: WebApp.platform,
        version: WebApp.version,
        colorScheme: WebApp.colorScheme,
        viewportHeight: WebApp.viewportHeight,
        isExpanded: WebApp.isExpanded
      });
      
      // Make Telegram WebApp available globally for debugging
      (window as any).TelegramWebApp = WebApp;
      
    } catch (error) {
      console.error('❌ Telegram WebApp initialization error:', error);
    }
    
    return () => {
      // Cleanup
      WebApp.disableClosingConfirmation();
    };
  }, []);
  
  // Handle back button
  useEffect(() => {
    const handleBack = () => {
      console.log('⬅️ Telegram back button clicked');
      if (window.history.length > 1) {
        window.history.back();
      }
    };
    
    WebApp.BackButton.onClick(handleBack);
    
    // Show back button when appropriate
    if (window.location.pathname !== '/') {
      WebApp.BackButton.show();
    }
    
    return () => {
      WebApp.BackButton.offClick(handleBack);
      WebApp.BackButton.hide();
    };
  }, []);
  
  return (
    <div className="telegram-app" data-telegram="true">
      {children}
    </div>
  );
}

// Export WebApp for use in other components
export { WebApp };
