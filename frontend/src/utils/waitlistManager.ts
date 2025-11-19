/**
 * Waitlist Management Utility
 * Handles Battle Arena waitlist entries
 */

export interface WaitlistEntry {
  email: string;
  walletAddress: string;
  timestamp: string;
  source: string;
}

export class WaitlistManager {
  private static STORAGE_KEY = 'battle_arena_waitlist';

  /**
   * Get all waitlist entries
   */
  static getEntries(): WaitlistEntry[] {
    try {
      const entries = localStorage.getItem(this.STORAGE_KEY);
      return entries ? JSON.parse(entries) : [];
    } catch (error) {
      console.error('Error reading waitlist entries:', error);
      return [];
    }
  }

  /**
   * Add new waitlist entry
   */
  static addEntry(entry: Omit<WaitlistEntry, 'timestamp'>): boolean {
    try {
      const entries = this.getEntries();
      
      // Check if email already exists
      if (entries.some(e => e.email === entry.email)) {
        return false; // Email already exists
      }

      const newEntry: WaitlistEntry = {
        ...entry,
        timestamp: new Date().toISOString()
      };

      entries.push(newEntry);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
      return true;
    } catch (error) {
      console.error('Error adding waitlist entry:', error);
      return false;
    }
  }

  /**
   * Export waitlist as CSV
   */
  static exportAsCSV(): string {
    const entries = this.getEntries();
    if (entries.length === 0) return '';

    const headers = ['Email', 'Wallet Address', 'Timestamp', 'Source'];
    const csvContent = [
      headers.join(','),
      ...entries.map(entry => [
        entry.email,
        entry.walletAddress,
        entry.timestamp,
        entry.source
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Get waitlist statistics
   */
  static getStats() {
    const entries = this.getEntries();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: entries.length,
      today: entries.filter(e => new Date(e.timestamp) >= today).length,
      thisWeek: entries.filter(e => new Date(e.timestamp) >= thisWeek).length,
      withWallets: entries.filter(e => e.walletAddress !== 'Not connected').length
    };
  }

  /**
   * Clear all entries (admin function)
   */
  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Console helper for viewing waitlist in browser dev tools
(window as any).viewWaitlist = () => {
  const entries = WaitlistManager.getEntries();
  const stats = WaitlistManager.getStats();
  
  console.log('🎮 Battle Arena Waitlist');
  console.log('========================');
  console.log('Stats:', stats);
  console.log('Entries:', entries);
  console.log('\nTo export CSV: copy(WaitlistManager.exportAsCSV())');
  
  return { entries, stats };
};

export default WaitlistManager;
