import { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WALLET_ADAPTERS } from '../../contexts/WalletContext';

const WALLET_ICONS: { [key: string]: string } = {
  Phantom: 'https://phantom.app/favicon.ico',
  Solflare: 'https://solflare.com/favicon.ico'
};

export const WalletSelector = () => {
  const { connect, connected } = useWallet();

  const handleConnect = useCallback(async (adapter: any) => {
    try {
      await connect();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }, [connect]);

  if (connected) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {WALLET_ADAPTERS.map((adapter) => (
        <button
          key={adapter.name}
          onClick={() => handleConnect(adapter)}
          className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <img
              src={WALLET_ICONS[adapter.name] || '/wallets/default.svg'}
              alt={adapter.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium">{adapter.name}</span>
          </div>
          <span className="text-sm text-gray-500">Solana Wallet</span>
        </button>
      ))}
    </div>
  );
};

export default WalletSelector;
