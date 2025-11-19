import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTokenGate } from './useTokenGate';

interface TrialData {
  count: number;
  lastUsed: number;
  deviceId: string;
  ipFingerprint?: string;
}

const MAX_TRIALS = 3;
const TRIAL_RESET_HOURS = 24; // Reset trials every 24 hours

export function useTrialGate() {
  const { connected, publicKey } = useWallet();
  const { hasAccess: hasTokenAccess, balance } = useTokenGate();
  const [trialsRemaining, setTrialsRemaining] = useState(MAX_TRIALS);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string>('');

  // Generate device fingerprint
  useEffect(() => {
    generateDeviceFingerprint();
  }, []);

  // Check trials when component mounts or wallet changes
  useEffect(() => {
    checkTrialStatus();
  }, [connected, publicKey, deviceId]);

  async function generateDeviceFingerprint() {
    try {
      // Create a unique device fingerprint using multiple factors
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
      }
      
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL(),
        navigator.hardwareConcurrency || 0,
        navigator.deviceMemory || 0
      ].join('|');

      // Create a hash of the fingerprint
      const encoder = new TextEncoder();
      const data = encoder.encode(fingerprint);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setDeviceId(hashHex.substring(0, 16)); // Use first 16 chars
    } catch (error) {
      console.error('Error generating device fingerprint:', error);
      // Fallback to simpler fingerprint
      const fallback = [
        navigator.userAgent,
        screen.width + 'x' + screen.height,
        Date.now().toString()
      ].join('|');
      setDeviceId(btoa(fallback).substring(0, 16));
    }
  }

  function getStorageKey(): string {
    // Use wallet address if connected, otherwise device fingerprint
    const identifier = connected && publicKey 
      ? publicKey.toString() 
      : deviceId;
    return `nova_trials_${identifier}`;
  }

  function checkTrialStatus() {
    if (!deviceId) {
      setIsLoading(true);
      return;
    }

    try {
      // If user has token access, they don't need trials
      if (hasTokenAccess) {
        setTrialsRemaining(MAX_TRIALS);
        setIsLoading(false);
        return;
      }

      const storageKey = getStorageKey();
      const storedData = localStorage.getItem(storageKey);
      
      if (!storedData) {
        // New user - grant full trials
        setTrialsRemaining(MAX_TRIALS);
        setIsLoading(false);
        return;
      }

      const trialData: TrialData = JSON.parse(storedData);
      const now = Date.now();
      const hoursSinceLastUse = (now - trialData.lastUsed) / (1000 * 60 * 60);

      // Reset trials if enough time has passed
      if (hoursSinceLastUse >= TRIAL_RESET_HOURS) {
        console.log('🔄 Trials reset after 24 hours');
        setTrialsRemaining(MAX_TRIALS);
        // Clear old data
        localStorage.removeItem(storageKey);
      } else {
        const remaining = Math.max(0, MAX_TRIALS - trialData.count);
        setTrialsRemaining(remaining);
        console.log(`📊 Trials remaining: ${remaining}/${MAX_TRIALS}`);
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
      setTrialsRemaining(MAX_TRIALS);
    } finally {
      setIsLoading(false);
    }
  }

  function useTrial(): boolean {
    // If user has token access, allow unlimited play
    if (hasTokenAccess) {
      return true;
    }

    // Check if trials available
    if (trialsRemaining <= 0) {
      console.log('❌ No trials remaining');
      return false;
    }

    try {
      const storageKey = getStorageKey();
      const storedData = localStorage.getItem(storageKey);
      
      let trialData: TrialData;
      if (storedData) {
        trialData = JSON.parse(storedData);
        trialData.count += 1;
        trialData.lastUsed = Date.now();
      } else {
        trialData = {
          count: 1,
          lastUsed: Date.now(),
          deviceId: deviceId
        };
      }

      // Store updated trial data
      localStorage.setItem(storageKey, JSON.stringify(trialData));
      
      // Update state
      const remaining = Math.max(0, MAX_TRIALS - trialData.count);
      setTrialsRemaining(remaining);
      
      console.log(`✅ Trial used. Remaining: ${remaining}/${MAX_TRIALS}`);
      return true;
    } catch (error) {
      console.error('Error using trial:', error);
      return false;
    }
  }

  function getTrialInfo() {
    const storageKey = getStorageKey();
    const storedData = localStorage.getItem(storageKey);
    
    if (!storedData) {
      return {
        used: 0,
        remaining: MAX_TRIALS,
        resetTime: null
      };
    }

    const trialData: TrialData = JSON.parse(storedData);
    const resetTime = new Date(trialData.lastUsed + (TRIAL_RESET_HOURS * 60 * 60 * 1000));
    
    return {
      used: trialData.count,
      remaining: trialsRemaining,
      resetTime: resetTime
    };
  }

  // Check if user can play (either has tokens or trials)
  const canPlay = hasTokenAccess || trialsRemaining > 0;
  
  // Determine access level
  const accessLevel = hasTokenAccess ? 'unlimited' : trialsRemaining > 0 ? 'trial' : 'blocked';

  return {
    canPlay,
    accessLevel,
    trialsRemaining,
    maxTrials: MAX_TRIALS,
    hasTokenAccess,
    tokenBalance: balance,
    isLoading,
    useTrial,
    getTrialInfo,
    checkTrialStatus
  };
}
